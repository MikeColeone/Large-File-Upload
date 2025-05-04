//使用es6的模块化语法，导入SparkMD5库
// import SparkMD5 from './spark-md5.min.js'  
// Worker 只能加载“浏览器可直接访问”的资源，因此你需要将依赖（如 spark-md5.min.js）放到 public/，并用 import.meta.url 构建绝对路径，以确保遵守同源策略、避免打包路径错误。
self.importScripts('spark-md5.min.js'); 

// self 是指当前的 Worker 上下文，类似于 window 对于主线程。
// 这里的 self 是 Worker 的全局对象，类似于 window 对于主线程。

/**
 * 
 * @param {} file 
 * @param {} chunkSize 
 * @returns 
 */
// 创建文件切片
function createFileChunk(file, chunkSize) {
  return new Promise((resolve, reject) => {
    let fileChunkList = []
    let cur = 0
    while (cur < file.size) {
      // Blob 接口的 slice() 方法创建并返回一个新的 Blob 对象，该对象包含调用它的 blob 的子集中的数据。
      fileChunkList.push({ chunkFile: file.slice(cur, cur + chunkSize) })
      cur += chunkSize
    }
    // 返回全部文件切片
    resolve(fileChunkList)
  })
}

// 加载并计算文件切片的MD5

async function calculateChunksHash(fileChunkList) {
  // 初始化脚本
  // const spark = new SparkMD5.ArrayBuffer()
  //创建一个新的 SparkMD5 实例，用于计算文件的 MD5 哈希值
  const spark = new self.SparkMD5.ArrayBuffer();  

  // 计算切片进度（拓展功能，可自行添加）
  let percentage = 0
  // 计算切片次数
  let count = 0


  // 处理文件切片 但是是错误的 
  // reader.readAsArrayBuffer 是异步的，for 循环会一下子跑完所有 iterations，但你还没等到数据读取完成。
  // 所以 spark.append() 的调用顺序可能乱掉，导致最终的 MD5 值错误。
  // 主线程根本无法知道什么时候最后一个切片处理完了。
  // 所以调用的时候一直显示正在解析
  // for (let i = 0; i < fileChunkList.length; i++) {
  //   const reader = new FileReader()
  //   reader.readAsArrayBuffer(fileChunkList[i].chunkFile)
  //   reader.onload = (e) => {
  //     spark.append(e.target.result)
  //   }
  // }
  
  // 递归函数，用于处理文件切片
  async function loadNext(index) {
    //索引大于等于切片长度的时候处理完毕
    if (index >= fileChunkList.length) {
      // 所有切片都已处理完毕
      return spark.end() // 返回最终的MD5值
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(fileChunkList[index].chunkFile)
      reader.onload = (e) => {
        // 读取完成后，调用 spark.append() 方法来处理当前切片的 ArrayBuffer 数据
        count++
        //调用spark.append()方法来处理当前切片的ArrayBuffer数据
        //使用流式（或增量）计算的方式来生成 MD5 哈希值。你逐步将数据输入到它中，每调用一次 append() 方法
        // 增量计算：SparkMD5 库允许你一次计算大文件的 MD5，而不需要一次性将所有数据加载到内存中。这是通过不断调用 append() 方法来增量计算数据的。
        spark.append(e.target.result)

        // 更新进度并处理下一个切片
        percentage += 100 / fileChunkList.length
        self.postMessage({ percentage }) // 发送进度到主线程

        resolve(loadNext(index + 1)) // 递归调用，处理下一个切片
      }
      reader.onerror = (err) => {
        reject(err) // 如果读取错误，则拒绝Promise
      }
    })
  }

  try {
    // 开始计算切片
    // 这里的 loadNext(0) 会返回一个 Promise，表示所有切片都已处理完毕
    //从第一个切片开始处理
    const fileHash = await loadNext(0) // 等待所有切片处理完毕
    self.postMessage({ percentage: 100, fileHash, fileChunkList }) // 发送最终结果到主线程
    self.close() // 关闭Worker
  } catch (err) {
    self.postMessage({ name: 'error', data: err }) // 发送错误到主线程
    self.close() // 关闭Worker
  }
}

// 监听消息
self.addEventListener(
  'message',  // 监听 'message' 事件
  async (e) => {  // 当事件发生时，执行这个异步回调函数
    try {
      // 解构 e.data 中的内容，获取文件和切片大小
      const { file, chunkSize } = e.data;

      // 使用 createFileChunk 函数将文件切分成多个切片
      const fileChunkList = await createFileChunk(file, chunkSize);

      // 调用 calculateChunksHash 函数计算切片的 MD5 哈希值
      await calculateChunksHash(fileChunkList);  // 等待 MD5 计算完成
    } catch (err) {
      // 捕获并处理错误
      // 这里实际上不会捕获到 calculateChunksHash 中的错误，因为错误已经在 Worker 内部处理了
      // 但如果未来有其他异步操作，这里可以捕获它们
      console.error('worker监听发生错误:', err);
    }
  },
  false  // 指定事件监听器是否在捕获阶段触发。默认值为 false，表示事件会在冒泡阶段触发。
);


// 主线程可以监听 Worker 是否发生错误。如果发生错误，Worker 会触发主线程的error事件。
self.addEventListener('error', function (event) {
  console.log('Worker触发主线程的error事件：', event)
  self.close() // 关闭Worker
})
