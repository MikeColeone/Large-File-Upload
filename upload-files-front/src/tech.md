- 为什么使用sparkmd5.Bufffer

  ```js
  const spark = new self.SparkMD5.ArrayBuffer();
  ```

  之所以使用 `ArrayBuffer`，是因为 SparkMD5 库支持两种主要的输入类型（不同的构造器）：

  ---

  ## 🔍 SparkMD5 有两个模式：

  ### 1. `SparkMD5()`（或 `SparkMD5.prototype.append(string)`）


  * 接收的是**字符串**输入
  * 用于处理文本内容（如 `"hello world"`）
  * 示例：
    ```js
    const spark = new SparkMD5();
    spark.append('hello');
    const hash = spark.end();
    ```

  ---

  ### 2. `SparkMD5.ArrayBuffer()`（或 `SparkMD5.ArrayBuffer.prototype.append(arrayBuffer)`）

  * 接收的是  **二进制数据** （如文件、图片、视频等）
  * 用于处理 `File`, `Blob`, `Uint8Array`, 或 `ArrayBuffer` 类型
  * 示例：
    ```js
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(arrayBufferChunk); // append file chunk as binary
    const hash = spark.end();
    ```

  ---

  ## ✅ 为什么用 `ArrayBuffer`？

  因为 **你大概率在处理文件上传或分片计算 MD5 的场景** ，这时读取文件（如用 `FileReader.readAsArrayBuffer()`）返回的就是 `ArrayBuffer` 类型：

  ```js
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = function () {
    const arrayBuffer = reader.result;
    spark.append(arrayBuffer);
    const hash = spark.end();
  };
  ```

  ---

  ## 🔧 总结：

  | 用法                           | 适合场景             | 构造器                     |
  | ------------------------------ | -------------------- | -------------------------- |
  | `new SparkMD5()`             | 文本（字符串）       | `SparkMD5()`             |
  | `new SparkMD5.ArrayBuffer()` | 二进制数据（如文件） | `SparkMD5.ArrayBuffer()` |

  ---

  所以，当你在做**文件上传、切片校验、秒传判断**这类需求时，使用 `ArrayBuffer` 是正确且必要的选择。

  你是在处理大文件上传和断点续传之类的场景吗？可以给你一份完整的 MD5 分片计算示例。
