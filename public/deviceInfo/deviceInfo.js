'use strick'

const handleError = err => {
  console.log('err=', err)
}

// 获取设备信息
const showDevices = _=> {
  navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
    console.log('deviceInfos', deviceInfos)
    // deviceInfos.forEach(deviceInfo => {
    //   console.log(`
    //   kind=${deviceInfo.kind};
    //   label=${deviceInfo.label};
    //   deviceId=${deviceInfo.deviceId};
    //   groupId=${deviceInfo.groupId}`)
    // })
  }).catch(handleError)
}

if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log('enumerateDevices is not supported! please use chrome')
  console.log('navigator.mediaDevices:', navigator.mediaDevices)
} else {
  showDevices()
  // const ePromise = navigator.mediaDevices.enumerateDevices
  // ePromise().then(gotDevices).catch()
}

