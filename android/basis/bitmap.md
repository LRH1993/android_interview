## 一、为什么Bitmap需要高效加载？

现在的高清大图，动辄就要好几M，而Android对单个应用所施加的内存限制，只有小几十M，如16M，这导致加载Bitmap的时候很容易出现内存溢出。如下异常信息，便是在开发中经常需要的：

> java.lang.OutofMemoryError:bitmap size exceeds VM budget

为了解决这个问题，就出现了Bitmap的高效加载策略。其实核心思想很简单。假设通过ImageView来显示图片，很多时候ImageView并没有原始图片的尺寸那么大，这个时候把整个图片加载进来后再设置给ImageView，显然是没有必要的，因为ImageView根本没办法显示原始图片。这时候就可以按一定的采样率来将图片缩小后再加载进来，这样图片既能在ImageView显示出来，又能降低内存占用从而在一定程度上避免OOM，提高了Bitmap加载时的性能。

## 二、Bitmap高效加载的具体方式

### 1.加载Bitmap的方式

Bitmap在Android中指的是一张图片。通过BitmapFactory类提供的四类方法：decodeFile,decodeResource,decodeStream和decodeByteArray,分别从文件系统，资源，输入流和字节数组中加载出一个Bitmap对象，其中decodeFile,decodeResource又间接调用了decodeStream方法，这四类方法最终是在Android的底层实现的，对应着BitmapFactory类的几个native方法。

### 2.BitmapFactory.Options的参数

#### ①inSampleSize参数

上述四类方法都支持BitmapFactory.Options参数，而Bitmap的按一定采样率进行缩放就是通过BitmapFactory.Options参数实现的，主要用到了inSampleSize参数，即采样率。通过对inSampleSize的设置，对图片的像素的高和宽进行缩放。

当inSampleSize=1，即采样后的图片大小为图片的原始大小。小于1，也按照1来计算。
当inSampleSize>1，即采样后的图片将会缩小，缩放比例为1/(inSampleSize的二次方)。

例如：一张1024 ×1024像素的图片，采用ARGB8888格式存储，那么内存大小1024×1024×4=4M。如果inSampleSize=2，那么采样后的图片内存大小：512×512×4=1M。

**注意：官方文档支出，inSampleSize的取值应该总是2的指数，如1，2，4，8等。如果外界传入的inSampleSize的值不为2的指数，那么系统会向下取整并选择一个最接近2的指数来代替。比如3，系统会选择2来代替。当时经验证明并非在所有Android版本上都成立。**

**关于inSampleSize取值的注意事项：**
通常是根据图片宽高实际的大小/需要的宽高大小，分别计算出宽和高的缩放比。但应该取其中最小的缩放比，避免缩放图片太小，到达指定控件中不能铺满，需要拉伸从而导致模糊。

例如：ImageView的大小是100×100像素，而图片的原始大小为200×300，那么宽的缩放比是2，高的缩放比是3。如果最终inSampleSize=2，那么缩放后的图片大小100×150，仍然合适ImageView。如果inSampleSize=3，那么缩放后的图片大小小于ImageView所期望的大小，这样图片就会被拉伸而导致模糊。

#### ②inJustDecodeBounds参数

我们需要获取加载的图片的宽高信息，然后交给inSampleSize参数选择缩放比缩放。那么如何能先不加载图片却能获得图片的宽高信息，通过inJustDecodeBounds=true，然后加载图片就可以实现只解析图片的宽高信息，并不会真正的加载图片，所以这个操作是轻量级的。当获取了宽高信息，计算出缩放比后，然后在将inJustDecodeBounds=false,再重新加载图片，就可以加载缩放后的图片。

**注意：BitmapFactory获取的图片宽高信息和图片的位置以及程序运行的设备有关，比如同一张图片放在不同的drawable目录下或者程序运行在不同屏幕密度的设备上，都可能导致BitmapFactory获取到不同的结果，和Android的资源加载机制有关。**

### 3.高效加载Bitmap的流程

①将BitmapFactory.Options的inJustDecodeBounds参数设为true并加载图片。

②从BitmapFactory.Options中取出图片的原始宽高信息，它们对应于outWidth和outHeight参数。

③根据采样率的规则并结合目标View的所需大小计算出采样率inSampleSize。

④将BitmapFactory.Options的inJustDecodeBounds参数设为false，然后重新加载图片。

## 三、Bitmap高效加载的代码实现

```java
 public static Bitmap decodeSampledBitmapFromResource(Resources res, int resId, int reqWidth, int reqHeight){
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        //加载图片
        BitmapFactory.decodeResource(res,resId,options);
        //计算缩放比
        options.inSampleSize = calculateInSampleSize(options,reqHeight,reqWidth);
        //重新加载图片
        options.inJustDecodeBounds =false;
        return BitmapFactory.decodeResource(res,resId,options);
    }

    private static int calculateInSampleSize(BitmapFactory.Options options, int reqHeight, int reqWidth) {
        int height = options.outHeight;
        int width = options.outWidth;
        int inSampleSize = 1;
        if(height>reqHeight||width>reqWidth){
            int halfHeight = height/2;
            int halfWidth = width/2;
            //计算缩放比，是2的指数
            while((halfHeight/inSampleSize)>=reqHeight&&(halfWidth/inSampleSize)>=reqWidth){
                inSampleSize*=2;
            }
        }


        return inSampleSize;
    }
```

这个时候就可以通过如下方式高效加载图片：

```java
mImageView.setImageBitmap(decodeSampledBitmapFromResource(getResources(),R.mipmap.ic_launcher,100,100);
```

除了BitmapFactory的decodeResource方法，其他方法也可以类似实现。