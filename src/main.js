const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

// ---- 環境設定 ----
const STORAGE_DIR = path.join(__dirname, '../__storage__')
const MAX_FILE_SIZE = '50mb'

// ---- 処理 ----
app.use(express.static('src/static')) // staticディレクトリの中身を公開する
app.use(express.json({ limit: MAX_FILE_SIZE })) // bodyを読めるようにする

/** アップロード */
app.post('/upload', (req, res) => {
  // ディレクトリがなければ作る
  try {
    if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR)
  } catch (error) {
    res.status(400).send(`ディレクトリの作成に失敗しました。\n${error}`)
    return
  }
  // 保存
  try {
    const first100chars = req.body.data.substring(0, 50) // 文字列が長すぎて正規表現の処理が重くなりすぎるため先頭だけ切り出す
    const match = /^data:(.*)?;base64,/.exec(first100chars)
    const base64 = req.body.data.substring(match[0].length)
    const buffer = Buffer.from(base64, 'base64')

    fs.writeFileSync(path.join(STORAGE_DIR, req.body.fileName), buffer)

    res.status(201).send('保存しました。')
  } catch (error) {
    res.status(400).send(`保存に失敗しました。\n${error}`)
  }
})

console.log('アップロード先: ', STORAGE_DIR)
app.listen(12345)
