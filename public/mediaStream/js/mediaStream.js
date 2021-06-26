'use strick'

const handleError = err => {
  console.log('err=', err)
}

const videPlay = document.getElementById('video')
const audioInputSelect = document.querySelector('select#audioInput')
const audioOutputSelect = document.querySelector('select#audioOutput')
const videoInputSelect = document.querySelector('select#videoInput')
/**
 * 请求获取音视频媒体流信息API
 * 一个流可能包含多个轨，音轨和视轨。
 */
const getUserMedia = _=> {
  const videoDeviceId = videoInputSelect.value
  // 针对音视频的限制和设置
  const constraints = {
    video: { //关闭设置false, 具体配置用对象
      width: 200,
      height: 200,
      frameRate: 30, //帧率
      facingMode: 'user', // enviroment:后置摄像头;user:前置摄像头;left:前置左侧;right:前置右侧
    },
    audio: {
      volume: 1, // 音量 ，0-1
      sampleRate: 8000, //采样率
    } 
  }
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    videPlay.srcObject = stream
    console.log('getUserMedia', stream)
    // * 获取设备信息
    // * 获取到权限才可以输出label和id
    return navigator.mediaDevices.enumerateDevices()
  }).then(deviceInfos => {
    console.log('deviceInfos', deviceInfos)

    
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
  }).catch(handleError)
}


if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.log('enumerateDevices is not supported! please use chrome')
  console.log('navigator.mediaDevices:', navigator.mediaDevices)
} else {
  // showDevices()
  getUserMedia()
  // const ePromise = navigator.mediaDevices.enumerateDevices
  // ePromise().then(gotDevices).catch()
}

