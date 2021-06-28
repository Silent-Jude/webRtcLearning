'use strick'

const handleError = err => {
  console.log('err=', err)
}

const videPlay = document.getElementById('video')
const audioInputSelect = document.querySelector('select#audioInput')
const audioOutputSelect = document.querySelector('select#audioOutput')
const videoInputSelect = document.querySelector('select#videoInput')

let deviceInfoList = []

const setDeviceInfo = deviceInfos => {
  console.log('deviceInfos', deviceInfos)
  if(deviceInfoList.length) return false
  deviceInfos.forEach(deviceInfo => {
    const option = document.createElement('option')
    option.text = deviceInfo.label
    option.value = deviceInfo.deviceId
    if(deviceInfo.kind === 'audioinput') {
      audioInputSelect.appendChild(option)
    } else if (deviceInfo.kind === 'audiooutput') {
      audioOutputSelect.appendChild(option)
    } else if (deviceInfo.kind === 'videoinput') {
      videoInputSelect.appendChild(option)
    }
  })
  deviceInfoList = deviceInfos
}

/**
 * 请求获取音视频媒体流信息API
 * 一个流可能包含多个轨，音轨和视轨。
 */
const getUserMedia = _=> {
  const videoDeviceId = videoInputSelect.value
  // 针对音视频的限制和设置,值改变后必须重新调用才生效。
  const constraints = {
    video: { //关闭设置false, 具体配置用对象  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_audio_tracks
      width: 200, // {min: 200, ideal: 250, max: 300 }
      height: 200,
      frameRate: {min:10, ideal: 15, max: 30 }, //帧率,width，height，这些数字都有min，max，ideal
      facingMode: 'enviroment', // enviroment:后置摄像头;user:前置摄像头;left:前置左侧;right:前置右侧
      deviceID: videoDeviceId || undefined, // 设备id，以便切换。
    },
    audio: { // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_video_tracks
      volume: 1, // 音量 ，0-1
      sampleRate: 8000, //采样率
      sampleSize: 16, // 采样位深，一般是16位
      echoCancellation: true, // true,false,是否启用回音消除
      autoGainControl: true, // true, false 是否启用自动增强。
      noiseSuppression: true, // true,false 降噪，也可以设置具体返回，但是文档里没有范围示例，且不在范围内的数值会导致报错。
      latency: 100.00, // 延时，长了影响即时性，短了容易造成卡顿。
      channelCount: 1, // 声道，单声道或者双声道，ConstrainULong类型，看不懂范围。
      // deviceID: undefined, // 设备id，以便切换。
      // groupID: '', // 代表同一个物理设备，输入输出这些类型。
    },
  }
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    // videPlay.srcObject = stream
    console.log('getUserMedia', stream)
    // 旧的浏览器可能没有srcObject
    if ("srcObject" in videPlay) {
      video.srcObject = stream;
    } else {
      // 防止在新的浏览器里使用它，应为它已经不再支持了
      videPlay.src = window.URL.createObjectURL(stream);
    }
    // * 获取设备信息
    // * 获取到权限才可以输出label和id
    return navigator.mediaDevices.enumerateDevices()
  }).then(deviceInfos => {
    setDeviceInfo(deviceInfos)
  }).catch(handleError)
}

const startVideo = _=> {
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log('enumerateDevices is not supported! please use chrome')
    console.log('navigator.mediaDevices:', navigator.mediaDevices)
  } else {
    getUserMedia()
  }
}

startVideo()

videoInputSelect.addEventListener('change', startVideo)