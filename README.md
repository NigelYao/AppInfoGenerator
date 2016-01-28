# AppInfoGenerator 应用信息获取 for android apps
get app category( type ), app info, app icon, and introduce for android apps by package id
根据包名，批量或者单独获取某个Android应用的基本信息（如应用名称，应用分类，应用简介及应用标签等）

## Usage 
`git clone https://github.com/NigelYao/AppInfoGenerator.git`

`npm start`

## Running
check out single package:

`GET http://localhost:8080/app/category/com.android.chrome`

or with multiple packages:

```
POST http://localhost:8080/app/category

formdata packages:com.google.earth,com.android.chrome,com.google.android.gm
```

## Also
try above with http://www.dive360.in:3000/app/category

your requested packages data will be cached on the server, and cached data will be synced with this repo

## Stucture
```
{
    "package": "lysesoft.andftp",
    "category": "软件",
    "subCategory": "系统工具",
    "appName": "FTP管理器",
    "appIconUrl": "http://img.wdjimg.com/mms/icon/v1/c/90/77adabe007decd1b7404cc8aa709790c_256_256.png",
    "appTextIntro": "AndFTP is a FTP, FTPS, SCP, SFTP client. It can manage several FTP configurations. It comes with both device and FTP file browser. It provides download, upload, synchronization and share features with resume support. It can open (local/remote), rename, delete, update permissions (chmod), run custom commands and more. SSH RSA/DSA keys support. Share from gallery is available. Intents are available for third party applications. Folder synchronization are available in Pro version only. Tags: FTP, FTPS (explicit, implicit over TLS), SFTP (Secure file transfer over SSH), SCP, client, sync, upload files, download files, Filezilla import, retry on transfer failure, resume, active, passive mode, multilanguage support, UTF8, streaming ",
    "tags": "",
    "flavor": "wandoujia",
    "flavorName": "豌豆荚"
}
```

## Credits
data matained from wandoujia.com due to much more complete database.
