import service from '../utils/index'

// 上传切片参数的接口
interface UploadFileParams {
  fileHash: string
  fileSize: number
  fileName: string
  index: number
  chunkFile?: File | Blob
  chunkHash: string
  chunkSize: number
  chunkNumber: number
  finish?: boolean
}

// 合并切片参数的接口
interface MergeChunkParams {
  chunkSize: number
  fileName: string
  fileSize: number
}

// 检查文件参数的接口
interface CheckFileParams {
  fileHash: string
  fileName: string
}

// 上传单个切片
export function uploadFile(data: UploadFileParams, onCancel?: (cancel: () => void) => void) {
  const controller = new AbortController()
  const signal = controller.signal
  const request = service({
    url: '/upload',
    method: 'post',
    data,
    signal
  })
  if (typeof onCancel === 'function') {
    onCancel(() => controller.abort())
  }
  return request
}

// 合并所有切片
export function mergeChunk(data: MergeChunkParams) {
  return service({
    url: '/merge',
    method: 'post',
    data
  })
}

// 检查文件是否存在
export function checkFile(data: CheckFileParams) {
  return service({
    url: '/verify',
    method: 'post',
    data
  })
}
