## 一、Android中的线程

在操作系统中，线程是操作系统调度的最小单元，同时线程又是一种受限的系统资源，即线程不可能无限制地产生，并且**线程的创建和销毁都会有相应的开销。**当系统中存在大量的线程时，系统会通过会时间片轮转的方式调度每个线程，因此线程不可能做到绝对的并行。

如果在一个进程中频繁地创建和销毁线程，显然不是高效的做法。正确的做法是采用线程池，一个线程池中会缓存一定数量的线程，通过线程池就可以避免因为频繁创建和销毁线程所带来的系统开销。

## 二、AsyncTask简介

AsyncTask是一个抽象类，它是由Android封装的一个轻量级异步类（轻量体现在使用方便、代码简洁），它可以在线程池中执行后台任务，然后把执行的进度和最终结果传递给主线程并在主线程中更新UI。

AsyncTask的内部封装了**两个线程池**(SerialExecutor和THREAD_POOL_EXECUTOR)和**一个Handler**(InternalHandler)。

其中**SerialExecutor线程池用于任务的排队，让需要执行的多个耗时任务，按顺序排列**，**THREAD_POOL_EXECUTOR线程池才真正地执行任务**，**InternalHandler用于从工作线程切换到主线程**。

#### 1.AsyncTask的泛型参数

AsyncTask的类声明如下：

```java
public abstract class AsyncTask<Params, Progress, Result>
```

AsyncTask是一个抽象泛型类。

其中，三个泛型类型参数的含义如下：

**Params：**开始异步任务执行时传入的参数类型；

**Progress：**异步任务执行过程中，返回下载进度值的类型；

**Result：**异步任务执行完成后，返回的结果类型；

**如果AsyncTask确定不需要传递具体参数，那么这三个泛型参数可以用Void来代替。**

有了这三个参数类型之后，也就控制了这个AsyncTask子类各个阶段的返回类型，如果有不同业务，我们就需要再另写一个AsyncTask的子类进行处理。

#### 2.AsyncTask的核心方法

**onPreExecute()**

这个方法会在**后台任务开始执行之间调用，在主线程执行。**用于进行一些界面上的初始化操作，比如显示一个进度条对话框等。

**doInBackground(Params...)**

这个方法中的所有代码都会**在子线程中运行，我们应该在这里去处理所有的耗时任务。**

任务一旦完成就可以通过return语句来将任务的执行结果进行返回，如果AsyncTask的第三个泛型参数指定的是Void，就可以不返回任务执行结果。**注意，在这个方法中是不可以进行UI操作的，如果需要更新UI元素，比如说反馈当前任务的执行进度，可以调用publishProgress(Progress...)方法来完成。**

**onProgressUpdate(Progress...)**

当在后台任务中调用了publishProgress(Progress...)方法后，这个方法就很快会被调用，方法中携带的参数就是在后台任务中传递过来的。**在这个方法中可以对UI进行操作，在主线程中进行，利用参数中的数值就可以对界面元素进行相应的更新。**

**onPostExecute(Result)**

当doInBackground(Params...)执行完毕并通过return语句进行返回时，这个方法就很快会被调用。返回的数据会作为参数传递到此方法中，**可以利用返回的数据来进行一些UI操作，在主线程中进行，比如说提醒任务执行的结果，以及关闭掉进度条对话框等。**

上面几个方法的调用顺序：
onPreExecute() --> doInBackground() --> publishProgress() --> onProgressUpdate() --> onPostExecute()

如果不需要执行更新进度则为onPreExecute() --> doInBackground() --> onPostExecute(),

除了上面四个方法，AsyncTask还提供了onCancelled()方法，**它同样在主线程中执行，当异步任务取消时，onCancelled()会被调用，这个时候onPostExecute()则不会被调用**，但是要注意的是，**AsyncTask中的cancel()方法并不是真正去取消任务，只是设置这个任务为取消状态，我们需要在doInBackground()判断终止任务。就好比想要终止一个线程，调用interrupt()方法，只是进行标记为中断，需要在线程内部进行标记判断然后中断线程。**

#### 3.AsyncTask的简单使用

```java
class DownloadTask extends AsyncTask<Void, Integer, Boolean> {  

    @Override  
    protected void onPreExecute() {  
        progressDialog.show();  
    }  

    @Override  
    protected Boolean doInBackground(Void... params) {  
        try {  
            while (true) {  
                int downloadPercent = doDownload();  
                publishProgress(downloadPercent);  
                if (downloadPercent >= 100) {  
                    break;  
                }  
            }  
        } catch (Exception e) {  
            return false;  
        }  
        return true;  
    }  

    @Override  
    protected void onProgressUpdate(Integer... values) {  
        progressDialog.setMessage("当前下载进度：" + values[0] + "%");  
    }  

    @Override  
    protected void onPostExecute(Boolean result) {  
        progressDialog.dismiss();  
        if (result) {  
            Toast.makeText(context, "下载成功", Toast.LENGTH_SHORT).show();  
        } else {  
            Toast.makeText(context, "下载失败", Toast.LENGTH_SHORT).show();  
        }  
    }  
}
```

这里我们模拟了一个下载任务，在doInBackground()方法中去执行具体的下载逻辑，在onProgressUpdate()方法中显示当前的下载进度，在onPostExecute()方法中来提示任务的执行结果。如果想要启动这个任务，只需要简单地调用以下代码即可：

```java
new DownloadTask().execute();
```

#### 4.使用AsyncTask的注意事项

①异步任务的实例必须在UI线程中创建，即AsyncTask对象必须在UI线程中创建。

②execute(Params... params)方法必须在UI线程中调用。

③不要手动调用onPreExecute()，doInBackground(Params... params)，onProgressUpdate(Progress... values)，onPostExecute(Result result)这几个方法。

④不能在doInBackground(Params... params)中更改UI组件的信息。

⑤一个任务实例只能执行一次，如果执行第二次将会抛出异常。

## 三、AsyncTask的源码分析

先从初始化一个AsyncTask时，调用的构造函数开始分析。

```java
public AsyncTask() {
        mWorker = new WorkerRunnable<Params, Result>() {
            public Result call() throws Exception {
                mTaskInvoked.set(true);
                Result result = null;
                try {
                    Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
                    //noinspection unchecked
                    result = doInBackground(mParams);
                    Binder.flushPendingCommands();
                } catch (Throwable tr) {
                    mCancelled.set(true);
                    throw tr;
                } finally {
                    postResult(result);
                }
                return result;
            }
        };

        mFuture = new FutureTask<Result>(mWorker) {
            @Override
            protected void done() {
                try {
                    postResultIfNotInvoked(get());
                } catch (InterruptedException e) {
                    android.util.Log.w(LOG_TAG, e);
                } catch (ExecutionException e) {
                    throw new RuntimeException("An error occurred while executing doInBackground()",
                            e.getCause());
                } catch (CancellationException e) {
                    postResultIfNotInvoked(null);
                }
            }
        };
    }
```

这段代码虽然看起来有点长，但实际上并没有任何具体的逻辑会得到执行，只是初始化了两个变量，mWorker和mFuture，并在初始化mFuture的时候将mWorker作为参数传入。mWorker是一个Callable对象，mFuture是一个FutureTask对象，这两个变量会暂时保存在内存中，稍后才会用到它们。 FutureTask实现了Runnable接口。

mWorker中的call()方法执行了耗时操作，即`result = doInBackground(mParams);`,然后把执行得到的结果通过`postResult(result);`,传递给内部的Handler跳转到主线程中。在这里这是实例化了两个变量，并没有开启执行任务。

**那么mFuture对象是怎么加载到线程池中，进行执行的呢？**

接着如果想要启动某一个任务，就需要调用该任务的execute()方法，因此现在我们来看一看execute()方法的源码，如下所示：

```java
 public final AsyncTask<Params, Progress, Result> execute(Params... params) {
        return executeOnExecutor(sDefaultExecutor, params);
    }
```

调用了executeOnExecutor()方法,具体执行逻辑在这个方法里面：

```java
  public final AsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec,
            Params... params) {
        if (mStatus != Status.PENDING) {
            switch (mStatus) {
                case RUNNING:
                    throw new IllegalStateException("Cannot execute task:"
                            + " the task is already running.");
                case FINISHED:
                    throw new IllegalStateException("Cannot execute task:"
                            + " the task has already been executed "
                            + "(a task can be executed only once)");
            }
        }

        mStatus = Status.RUNNING;

        onPreExecute();

        mWorker.mParams = params;
        exec.execute(mFuture);

        return this;
    }
```

可以 看出，先执行了onPreExecute()方法，然后具体执行耗时任务是在`exec.execute(mFuture)`，把构造函数中实例化的mFuture传递进去了。

**exec具体是什么？**

从上面可以看出具体是sDefaultExecutor，再追溯看到是SerialExecutor类，具体源码如下：

```java
private static class SerialExecutor implements Executor {
        final ArrayDeque<Runnable> mTasks = new ArrayDeque<Runnable>();
        Runnable mActive;

        public synchronized void execute(final Runnable r) {
            mTasks.offer(new Runnable() {
                public void run() {
                    try {
                        r.run();
                    } finally {
                        scheduleNext();
                    }
                }
            });
            if (mActive == null) {
                scheduleNext();
            }
        }

        protected synchronized void scheduleNext() {
            if ((mActive = mTasks.poll()) != null) {
                THREAD_POOL_EXECUTOR.execute(mActive);
            }
        }
    }
```

终于追溯到了调用了SerialExecutor 类的execute方法。SerialExecutor 是个静态内部类，是所有实例化的AsyncTask对象公有的，SerialExecutor 内部维持了一个队列，通过锁使得该队列保证AsyncTask中的任务是串行执行的，即多个任务需要一个个加到该队列中，然后执行完队列头部的再执行下一个，以此类推。

在这个方法中，有两个主要步骤。
①向队列中加入一个新的任务，即之前实例化后的mFuture对象。

②调用 `scheduleNext()`方法，调用THREAD_POOL_EXECUTOR执行队列头部的任务。

**由此可见SerialExecutor 类仅仅为了保持任务执行是串行的，实际执行交给了THREAD_POOL_EXECUTOR。**

**THREAD_POOL_EXECUTOR又是什么？**

```java
 ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
                CORE_POOL_SIZE, MAXIMUM_POOL_SIZE, KEEP_ALIVE_SECONDS, TimeUnit.SECONDS,
                sPoolWorkQueue, sThreadFactory);
        threadPoolExecutor.allowCoreThreadTimeOut(true);
        THREAD_POOL_EXECUTOR = threadPoolExecutor;
```

实际是个线程池，开启了一定数量的核心线程和工作线程。然后调用线程池的execute()方法。执行具体的耗时任务，即开头构造函数中mWorker中call()方法的内容。先执行完doInBackground()方法，又执行postResult()方法，下面看该方法的具体内容：

```java
 private Result postResult(Result result) {
        @SuppressWarnings("unchecked")
        Message message = getHandler().obtainMessage(MESSAGE_POST_RESULT,
                new AsyncTaskResult<Result>(this, result));
        message.sendToTarget();
        return result;
    }
```

该方法向Handler对象发送了一个消息，下面具体看AsyncTask中实例化的Hanlder对象的源码：

```java
private static class InternalHandler extends Handler {
        public InternalHandler() {
            super(Looper.getMainLooper());
        }

        @SuppressWarnings({"unchecked", "RawUseOfParameterizedType"})
        @Override
        public void handleMessage(Message msg) {
            AsyncTaskResult<?> result = (AsyncTaskResult<?>) msg.obj;
            switch (msg.what) {
                case MESSAGE_POST_RESULT:
                    // There is only one result
                    result.mTask.finish(result.mData[0]);
                    break;
                case MESSAGE_POST_PROGRESS:
                    result.mTask.onProgressUpdate(result.mData);
                    break;
            }
        }
    }
```

在InternalHandler 中，如果收到的消息是MESSAGE_POST_RESULT，即执行完了doInBackground()方法并传递结果，那么就调用finish()方法。

```java
private void finish(Result result) {
        if (isCancelled()) {
            onCancelled(result);
        } else {
            onPostExecute(result);
        }
        mStatus = Status.FINISHED;
    }
```

如果任务已经取消了，回调onCancelled()方法，否则回调 onPostExecute()方法。

如果收到的消息是MESSAGE_POST_PROGRESS，回调onProgressUpdate()方法，更新进度。

**InternalHandler是一个静态类，为了能够将执行环境切换到主线程，因此这个类必须在主线程中进行加载。所以变相要求AsyncTask的类必须在主线程中进行加载。**

到此为止，从任务执行的开始到结束都从源码分析完了。

#### AsyncTask的串行和并行

从上述源码分析中分析得到，默认情况下AsyncTask的执行效果是串行的，因为有了SerialExecutor类来维持保证队列的串行。如果想使用并行执行任务，那么可以直接跳过SerialExecutor类，使用executeOnExecutor()来执行任务。

## 四、AsyncTask使用不当的后果

1.)生命周期

AsyncTask不与任何组件绑定生命周期，所以在Activity/或者Fragment中创建执行AsyncTask时，最好在Activity/Fragment的onDestory()调用 cancel(boolean)；

2.)内存泄漏

如果AsyncTask被声明为Activity的非静态的内部类，那么AsyncTask会保留一个对创建了AsyncTask的Activity的引用。如果Activity已经被销毁，AsyncTask的后台线程还在执行，它将继续在内存里保留这个引用，导致Activity无法被回收，引起内存泄露。

3.) 结果丢失

屏幕旋转或Activity在后台被系统杀掉等情况会导致Activity的重新创建，之前运行的AsyncTask（非静态的内部类）会持有一个之前Activity的引用，这个引用已经无效，这时调用onPostExecute()再去更新界面将不再生效。