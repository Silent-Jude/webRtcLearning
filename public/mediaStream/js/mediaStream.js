'use strick'

import gfilter from './gfilter.js'

const handleError = (err) => {
	console.log('err=', err)
}

const videoPlay = document.getElementById('video')

//devices
const audioInputSelect = document.querySelector('select#audioInput')
const audioOutputSelect = document.querySelector('select#audioOutput')
const videoInputSelect = document.querySelector('select#videoInput')

//filter
const filtersSelect = document.querySelector('select#filter')

//snapshot
const snapshotBtn = document.getElementById('snapshotBtn')
const snapshotCanvas = document.getElementById('snapshotCanvas')
const snapshotFilterCanvas = document.getElementById('snapshotFilterCanvas')
snapshotCanvas.width = videoPlay.width
snapshotCanvas.height = videoPlay.height
snapshotFilterCanvas.width = videoPlay.width
snapshotFilterCanvas.height = videoPlay.height

//audio
const audioPlay = document.getElementById('audio')
const audioToggle = document.getElementById('audioToggle')
let showAudio = false

// recordVideo
const startRecordBtn = document.getElementById('startRecordBtn')
const playRecordBtn = document.getElementById('playRecordBtn')
const downloadRecordBtn = document.getElementById('downloadRecordBtn')
const recVideo = document.getElementById('recVideo')
let startRecord = false
let mediaRecorder = null
let mediaStream = null
let mediaBuffer = []
let mediaBlob = null



let deviceInfoList = []
const getDeviceInfo = (deviceInfos) => {
	console.log('deviceInfos', deviceInfos)
	if (deviceInfoList.length) return false
	deviceInfos.forEach((deviceInfo) => {
		const option = document.createElement('option')
		option.text = deviceInfo.label
		option.value = deviceInfo.deviceId
		if (deviceInfo.kind === 'audioinput') {
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
const getUserMedia = (_) => {
	const videoDeviceId = videoInputSelect.value

	// 针对音视频的限制和设置,值改变后必须重新调用才生效。
	const constraints = {
		video: {
			//关闭设置false, 具体配置用对象  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_audio_tracks
			width: 200, // {min: 200, ideal: 250, max: 300 }
			height: 200,
			frameRate: { min: 10, ideal: 15, max: 30 }, //帧率,width，height，这些数字都有min，max，ideal
			facingMode: 'enviroment', // enviroment:后置摄像头;user:前置摄像头;left:前置左侧;right:前置右侧
			deviceId: videoDeviceId || undefined, // 设备id，以便切换。
		},
		audio: false,
		// audio: { // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_video_tracks
		//   volume: 1, // 音量 ，0-1
		//   sampleRate: 8000, //采样率
		//   sampleSize: 16, // 采样位深，一般是16位
		//   echoCancellation: true, // true,false,是否启用回音消除
		//   autoGainControl: true, // true, false 是否启用自动增强。
		//   noiseSuppression: true, // true,false 降噪，也可以设置具体返回，但是文档里没有范围示例，且不在范围内的数值会导致报错。
		//   latency: 100.00, // 延时，长了影响即时性，短了容易造成卡顿。
		//   channelCount: 1, // 声道，单声道或者双声道，ConstrainULong类型，看不懂范围。
		//   // deviceId: undefined, // 设备id，以便切换。
		//   // groupID: '', // 代表同一个物理设备，输入输出这些类型。
		// },
	}

	navigator.mediaDevices
		.getUserMedia(constraints)
		.then((stream) => {
			// videoPlay.srcObject = stream
			console.log('getUserMedia', stream)
			// 旧的浏览器可能没有srcObject
			if ('srcObject' in videoPlay) {
				video.srcObject = stream
			} else {
				// 防止在新的浏览器里使用它，应为它已经不再支持了
				videoPlay.src = window.URL.createObjectURL(stream)
			}
      mediaStream = stream
      
      // 媒体流的一些方法
      // MediaStream.addTrack()
      // MediaStream.removeTrack()
      // MediaStream.getVideoTracks()
      // MediaStream.getAudioTracks()
      // MediaStream.stop()

      // 媒体流的一些事件
      // MediaStream.onaddtrack
      // MediaStream.onremoveatrack
      // MediaStream.onended


      const videoTrackList = stream.getVideoTracks()
      const currentVideoTrack = videoTrackList[0]
      const constraints = currentVideoTrack.getSettings()
      // document.getElementById('videoInfo').innerText = JSON.stringify(constraints,null,2)
			console.log('视频约束信息constraints为：', constraints)
			console.log('videoDeviceId', videoDeviceId)
			// * 获取设备信息
			// * 获取到权限才可以输出label和id
			return navigator.mediaDevices.enumerateDevices()
		})
		.then((deviceInfos) => {
			getDeviceInfo(deviceInfos)
		})
		.catch(handleError)
}

const startVideo = (_) => {
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		console.log('enumerateDevices is not supported! please use chrome')
		console.log('navigator.mediaDevices:', navigator.mediaDevices)
	} else {
		getUserMedia()
	}
}

startVideo()

const startAudio = _ => {
  if(!showAudio) {
    audioPlay.srcObject = null
    return false
  }
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		console.log('enumerateDevices is not supported! please use chrome')
		console.log('navigator.mediaDevices:', navigator.mediaDevices)
	} else {
		navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    }).then(stream => {
			// videoPlay.srcObject = stream
			console.log('getUserMedia', stream)
			// 旧的浏览器可能没有srcObject
			if ('srcObject' in audioPlay) {
				audioPlay.srcObject = stream
			} else {
				// 防止在新的浏览器里使用它，应为它已经不再支持了
				audioPlay.src = window.URL.createObjectURL(stream)
			}
    })
	}
}
startAudio()


videoInputSelect.addEventListener('change', startVideo)

filtersSelect.addEventListener('change', (_) => {
	videoPlay.className = filtersSelect.value
})

snapshotBtn.addEventListener('click', (_) => {
	const filterCanvasContext = snapshotFilterCanvas.getContext('2d')
	const originCanvasContext = snapshotCanvas.getContext('2d')
	originCanvasContext.drawImage(videoPlay, 0, 0, snapshotCanvas.width, snapshotCanvas.height)
	const length = snapshotCanvas.width * snapshotCanvas.height * 4
	let originCanvasData = originCanvasContext.getImageData(0, 0, snapshotCanvas.width, snapshotCanvas.height)
	let originBinaryData = originCanvasData.data
	switch (videoPlay.className) {
		case 'none':
	    filterCanvasContext.drawImage(videoPlay, 0, 0, snapshotCanvas.width, snapshotCanvas.height)
			break
		case 'blur':
			gfilter.blurProcess(originCanvasData)
			filterCanvasContext.putImageData(originCanvasData, 0, 0)
			break
		case 'grayscale':
			gfilter.grayProcess(originBinaryData, length)
			filterCanvasContext.putImageData(originCanvasData, 0, 0)
			break
		case 'invert':
			gfilter.invertProcess(originBinaryData, length)
			filterCanvasContext.putImageData(originCanvasData, 0, 0)
			break
	}
})

audioToggle.addEventListener('click', _=>{
  showAudio = !showAudio
  startAudio()
  if(showAudio) {
    audioPlay.style.display = 'inline'
  } else {
    audioPlay.style.display = 'none'
  }
})

const handleDataAvailable = e => {
  if(e && e.data && e.data.size > 0) {
    mediaBuffer.push(e.data)
    mediaBlob = new Blob(mediaBuffer, {type: 'video/webm'})
  }
}

const startRecordVideo = _=> {
  // 先清空buffer数据
  mediaBuffer = []
  const options = {
    mimeType: 'video/webm;codecs=vp8'
  }
  if(!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not supported!`)
    return false
  }
  try {
    mediaRecorder = new MediaRecorder(mediaStream, options)
  } catch(e) {
    console.error('Failed to create MediaRecorder:', e)
    return false
  }
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.start(10)
}

const stopRecordVideo = _=>{
  mediaRecorder.stop()
}

startRecordBtn.addEventListener('click', _=>{
  // const mediaRecorder = new MediaRecorder()
  if(startRecord) { // 已经录制完了。 
    stopRecordVideo()
    playRecordBtn.disabled = false
    downloadRecordBtn.disabled = false
    startRecordBtn.innerText = '开始录制'
    startRecord = false
  } else { // 还没有录制。
    startRecordVideo()
    startRecordBtn.innerText = '录制结束'
    playRecordBtn.disabled = true
    downloadRecordBtn.disabled = true
    startRecord = true
  }
})

playRecordBtn.onclick = _=> {
  recVideo.srcObject = null
  recVideo.src = window.URL.createObjectURL(mediaBlob)
  recVideo.controls = true
  recVideo.play()
}

downloadRecordBtn.onclick = _=>{
  let aDom = document.createElement('a')
  aDom.href = window.URL.createObjectURL(mediaBlob)
  aDom.download = `${new Date().toTimeString()}.webm`
  aDom.click()
}