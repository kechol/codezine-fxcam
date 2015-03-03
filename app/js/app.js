(function() {
  'use strict';

  // カメラリソース
  var camera;

  // ストレージ
  var storage;

  // DOM
  var previewVideo;
  var captureBtn;
  var effectLabel;
  var effectRightBtn;
  var effectLeftBtn;


  // エフェクト
  var effects = [];
  var effectIndex = 0;

  function releaseCamera() {
    console.log('releaseCamera');

    if(camera) {
      camera.release();
    }
  }

  function getCamera() {
    console.log('getCamera');

    // カメラ取得時のオプション
    var options = {
      mode: 'picture',
      recorderProfile: 'jpg',
      previewSize: {
        width: 1280,
        height: 720
      }
    };

    // `getListOfCameras()`は背面カメラ、前面カメラの順に配列が返る
    var type = navigator.mozCameras.getListOfCameras()[0];

    function onSuccess(success) {
      // スコープ外に値を保持
      camera = success;
      console.log('getCamera:success', camera);

      // プレビューの再生
      previewVideo.mozSrcObject = camera;
      previewVideo.play();

      // エフェクトの保存
      effects = camera.capabilities.effects;
    }

    function onError(error) {
      console.warn('getCamera:error', error);
      // カメラ取得失敗時の処理
    }

    // カメラがすでに取得されている場合はリリース
    releaseCamera();
    navigator.mozCameras.getCamera(type, options, onSuccess, onError);
  }

  function captureStart(e) {
    console.log('captureStart', e);
    if(!camera) return;

    function onSuccess(success) {
      console.log('autoFocus:success', success);
    }

    function onError(error) {
      console.warn('autoFocus:error', error);
    }

    camera.autoFocus(onSuccess, onError);
  }

  function captureEnd(e) {
    console.log('captureEnd', e);
    if(!camera) return;

    var options = {
      pictureSize: camera.capabilities.pictureSizes[0], // 最大サイズ
      fileFormat: 'jpeg'
    };

    function onSuccess(success) {
      console.log('takePicture:success', success);

      // 画像をストレージへ保存
      var filename = 'fxcam_' + Date.now() + '.jpg';
      storage.addNamed(success, filename);

      alert("画像を保存しました\n" + filename);

      // プレビューの再開
      camera.resumePreview();
    };

    function onError(error) {
      console.log('takePicture:error', error);
      // カメラ取得失敗時の処理
    };

    camera.takePicture(options, onSuccess, onError);
  }

  function onVisibilityChange() {
    console.log('onVisibilityChange', document.hidden);

    if(document.hidden) {
      releaseCamera();
    } else {
      getCamera();
    }
  }

  function changeEffectRight(e) {
    console.log('changeEffectRight', effectIndex);
    if(!camera) return;

    effectIndex = (effectIndex < effects.length-1) ? effectIndex + 1 : 0;
    effectLabel.innerHTML = camera.effect = effects[effectIndex];
  }

  function changeEffectLeft(e) {
    console.log('changeEffectLeft', effectIndex);
    if(!camera) return;

    effectIndex = (effectIndex > 0) ? effectIndex - 1 : effects.length - 1;
    effectLabel.innerHTML = camera.effect = effects[effectIndex];
  }

  function init() {
    // ストレージの取得
    storage = navigator.getDeviceStorage('pictures');

    // DOMの取得とイベント処理
    previewVideo = document.getElementById('preview');

    captureBtn = document.getElementById('captureBtn');
    captureBtn.addEventListener('touchstart', captureStart, false);
    captureBtn.addEventListener('touchend', captureEnd, false);

    effectLabel = document.getElementById('effectLabel');

    effectRightBtn = document.getElementById('effectRightBtn');
    effectRightBtn.addEventListener('touchend', changeEffectRight, false);

    effectLeftBtn = document.getElementById('effectLeftBtn');
    effectLeftBtn.addEventListener('touchend', changeEffectLeft, false);

    // カメラの取得
    getCamera();
  }

  window.addEventListener('DOMContentLoaded', init, false);
  window.addEventListener('visibilitychange', onVisibilityChange, false);
  window.addEventListener('unload', releaseCamera, false);
})();
