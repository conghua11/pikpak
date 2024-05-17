

//  加密参数函数
const hashlib = require('crypto');
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function item_compare(img_list, mode_list) {
    let score = 0;
    let rank = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (img_list[i][j] !== mode_list[i][j]) {
                score += 1;
            }
        }
    }
    if (score === 2) {
        rank += 1;
    }
    return rank;
}

function list_compare(frames) {
    let score_list = [];
    let flag = 0;
    for (const frame of frames) {
        const img_list = frame.matrix;
        let scores = 0;
        for (const mode_frame of frames) {
            const mode_list = mode_frame.matrix;
            const one_score = item_compare(img_list, mode_list);
            scores += one_score;
        }
        score_list.push(scores);
        flag += 1;
    }
    for (let i = 0; i < 12; i++) {
        if (score_list[i] === 11) {
            // console.log(i)
            return i;
        }
    }
}

function r(e, t) {
    let n = t - 1;
    if (n < 0) {
        n = 0;
    }
    let r = e[n];
    let u = Math.floor(r['row'] / 2) + 1;
    let c = Math.floor(r['column'] / 2) + 1;
    let f = r['matrix'][u][c];
    let l = t + 1;
    if (l >= e.length) {
        l = t;
    }
    let d = e[l];
    let p = l % d['row'];
    let h = l % d['column'];
    let g = d['matrix'][p][h];
    let y = e[t];
    let m = 3 % y['row'];
    let v = 7 % y['column'];
    let w = y['matrix'][m][v];
    let b = parseInt(i(f)) + o(w);
    let x = parseInt(i(w)) - o(f);
    return [s(a(i(f), o(f))), s(a(i(g), o(g))), s(a(i(w), o(w))), s(a(b, x))];
}

function i(e) {
    return parseInt(e.split(",")[0]);
}

function o(e) {
    return parseInt(e.split(",")[1]);
}

function a(e, t) {
    return e + "^⁣^" + t;
}

function s(e) {
    let t = 0;
    let n = e.length;
    for (let r = 0; r < n; r++) {
        t = u(31 * t + e.charCodeAt(r));
    }
    return t;
}

function u(e) {
    let t = -2147483648;
    let n = 2147483647;
    if (e > n) {
        return t + (e - n) % (n - t + 1) - 1;
    }
    if (e < t) {
        return n - (t - e) % (n - t + 1) + 1;
    }
    return e;
}

function c(e, t) {
    return s(e + "⁣" + t);
}

function img_jj(e, t, n) {
    return {
        'ca': r(e, t),
        'f': c(n, t)
    };
}

async function getSign(xid, t) {
    const e = [
        {alg: "md5", salt: "KHBJ07an7ROXDoK7Db"},
        {alg: "md5", salt: "G6n399rSWkl7WcQmw5rpQInurc1DkLmLJqE"},
        {alg: "md5", salt: "JZD1A3M4x+jBFN62hkr7VDhkkZxb9g3rWqRZqFAAb"},
        {alg: "md5", salt: "fQnw/AmSlbbI91Ik15gpddGgyU7U"},
        {alg: "md5", salt: "/Dv9JdPYSj3sHiWjouR95NTQff"},
        {alg: "md5", salt: "yGx2zuTjbWENZqecNI+edrQgqmZKP"},
        {alg: "md5", salt: "ljrbSzdHLwbqcRn"},
        {alg: "md5", salt: "lSHAsqCkGDGxQqqwrVu"},
        {alg: "md5", salt: "TsWXI81fD1"},
        {alg: "md5", salt: "vk7hBjawK/rOSrSWajtbMk95nfgf3"}]
    let md5_hash = `YvtoWO6GNHiuCl7xundefinedmypikpak.com${xid}${t}`;
    e.forEach(item => {
        md5_hash += item.salt;
        md5_hash = hashlib.createHash('md5').update(md5_hash).digest('hex');
    });
    return md5_hash;
}

//  邮箱API函数
async function getMail(){
    const domains = ["2cn.free.hr", "cnacg.free.hr", "00002.free.hr"]
    const demo = domains[Math.floor(Math.random() * domains.length)]
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    const url = `https://cloudflare_temp_email.jpanjhon.workers.dev/api/new_address?name=${result}&domain=${demo}`
    return new Promise( async (resolve, reject) => {
        try {
            const response = await fetch(url);
            const responseData = await response.json();
            const jwt = responseData['jwt']
            const data ={
                jwt : jwt,
                mail : 'tmp' + result + '@' + demo
            }
            console.log(data)
            resolve(data);
        }catch (error){
            console.log(error)
        }
    });
}

async function getCode(jwt) {
    const url = 'https://cloudflare_temp_email.jpanjhon.workers.dev/api/mails?limit=20&offset=0'
    const headers = {
        'Authorization': 'Bearer ' + jwt
    }
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(url, {headers: headers});
            const responseData = await response.json();
            console.log(responseData)
            if (responseData['results'].length === 0){
                console.log('等待接收邮件...')
                await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒钟
                const code = await getCode(jwt)
                resolve(code)
            }
            else {
                console.log('接收到邮件, 提取验证码...');
                const regex = /\b\d{6}\b/g; // 匹配6位数字的正则表达式
                const matches = responseData['results'][0]['message'].match(regex); // 查找匹配的数字
                if (matches && matches.length > 0) {
                    console.log('验证码:', matches[0])
                    resolve(matches[0]); // 返回第一个匹配到的6位数字
                } else {
                    resolve(null); // 如果没有找到，返回null
                }
            }
        } catch (error) {
            reject(error)
        }
    });
}

//  网络请求函数
async function init(xid, mail){
    return new Promise(async (resolve, reject) => {
        const url = 'https://user.mypikpak.com/v1/shield/captcha/init'
        const body = {
            "client_id": "YvtoWO6GNHiuCl7x",
            "action": "POST:/v1/auth/verification",
            "device_id": xid,
            "captcha_token": "",
            "meta": {
                "email": mail
            }
        }
        // 将请求体转换为字符串形式
        const bodyString = JSON.stringify(body);
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'user.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'MainWindow Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'accept-language': 'zh-CN',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-device-model': 'electron%2F18.3.15',
            'x-device-name': 'PC-Electron',
            'x-device-sign': 'wdi10.ce6450a2dc704cd49f0be1c4eca40053xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x-net-work-type': 'NONE',
            'x-os-version': 'Win32',
            'x-platform-version': '1',
            'x-protocol-version': '301',
            'x-provider-name': 'NONE',
            'x-sdk-version': '6.0.0'
        }
        try{
            const response = await fetch(url, {
                method:'POST',
                headers:headers,
                body:JSON.stringify(body)
            })
            const responseData = await response.json()
            if (responseData['url']) {
                console.log(responseData)
                resolve(responseData)
            }
            else {
                return Promise.reject(responseData['error_description']);
            }
        }catch (error){
            reject(error)
        }
    })
}

async function getImage(xid) {
    const url = "https://user.mypikpak.com/pzzl/gen";
    const params = new URLSearchParams({
        "deviceid": xid,
        "traceid": ""
    });

    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(url + '?' + params.toString());
            const imgsJson = await response.json();
            console.log(imgsJson)
            const frames = imgsJson["frames"];
            const pid = imgsJson['pid'];
            const traceid = imgsJson['traceid'];
            const selectId = list_compare(frames);
            const result = {frames, pid, traceid, selectId};
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
}

async function getNewToken(result, xid, captcha) {
    return new Promise(async (resolve, reject) => {
        try {
            const frames = result.frames;
            const selectId = result.selectId;
            const traceid = result.traceid;
            const pid = result.pid;
            const json = img_jj(frames, parseInt(selectId), pid);
            const f = json.f;
            const npac = json.ca;
            const params = new URLSearchParams({
                pid: pid,
                deviceid: xid,
                traceid: traceid,
                f: f,
                n: npac[0],
                p: npac[1],
                a: npac[2],
                c: npac[3]
            });
            console.log(params)
            const response1 = await fetch(`https://user.mypikpak.com/pzzl/verify?${params.toString()}`);
            const response2 = await fetch(`https://user.mypikpak.com/credit/v1/report?deviceid=${xid}&captcha_token=${captcha}&type=pzzlSlider&result=0&data=${pid}&traceid=${traceid}`);
            const responseDate = await response2.json();
            console.log(responseDate)
            resolve(responseDate);
        } catch (error) {
            reject(error);
        }
    });
}

async function verification(captchaToken, xid, mail) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://user.mypikpak.com/v1/auth/verification'
        const body = {
            "email": mail,
            "target": "ANY",
            "usage": "REGISTER",
            "locale": "zh-CN",
            "client_id": "YvtoWO6GNHiuCl7x"
        }
        // 将请求体转换为字符串形式
        const bodyString = JSON.stringify(body);
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'user.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'MainWindow Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'accept-language': 'zh-CN',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-captcha-token': captchaToken,
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-device-model': 'electron%2F18.3.15',
            'x-device-name': 'PC-Electron',
            'x-device-sign': 'wdi10.ce6450a2dc704cd49f0be1c4eca40053xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x-net-work-type': 'NONE',
            'x-os-version': 'Win32',
            'x-platform-version': '1',
            'x-protocol-version': '301',
            'x-provider-name': 'NONE',
            'x-sdk-version': '6.0.0'
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const responseData = await response.json()
            console.log('验证滑块', responseData)
            resolve(responseData)
        }catch (error) {
            reject(error)
        }
    })
}

async function verify(xid, verificationId, code) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://user.mypikpak.com/v1/auth/verification/verify'
        const body = {
            "verification_id": verificationId,
            "verification_code": code,
            "client_id": "YvtoWO6GNHiuCl7x"
        }
        // 将请求体转换为字符串形式
        const bodyString = JSON.stringify(body);
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'user.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'MainWindow Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'accept-language': 'zh-CN',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-device-model': 'electron%2F18.3.15',
            'x-device-name': 'PC-Electron',
            'x-device-sign': 'wdi10.ce6450a2dc704cd49f0be1c4eca40053xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x-net-work-type': 'NONE',
            'x-os-version': 'Win32',
            'x-platform-version': '1',
            'x-protocol-version': '301',
            'x-provider-name': 'NONE',
            'x-sdk-version': '6.0.0'
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const responseData = await response.json()
            console.log(responseData)
            resolve(responseData)
        }catch (error) {
            reject(error)
        }
    })
}

async function signup(xid, mail, code, verificationToken) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://user.mypikpak.com/v1/auth/signup'
        const body = {
            "email": mail,
            "verification_code": code,
            "verification_token": verificationToken,
            "password": "pw123456",
            "client_id": "YvtoWO6GNHiuCl7x"
        }
        // 将请求体转换为字符串形式
        const bodyString = JSON.stringify(body);
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'user.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'MainWindow Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'accept-language': 'zh-CN',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-device-model': 'electron%2F18.3.15',
            'x-device-name': 'PC-Electron',
            'x-device-sign': 'wdi10.ce6450a2dc704cd49f0be1c4eca40053xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x-net-work-type': 'NONE',
            'x-os-version': 'Win32',
            'x-platform-version': '1',
            'x-protocol-version': '301',
            'x-provider-name': 'NONE',
            'x-sdk-version': '6.0.0'
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const responseData = await response.json()
            console.log(responseData)
            resolve(responseData)
        }catch (error) {
            reject(error)
        }
    })
}

async function init1(xid, accessToken, sub, sign, t) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://user.mypikpak.com/v1/shield/captcha/init'
        const body = {
            "client_id": "YvtoWO6GNHiuCl7x",
            "action": "POST:/vip/v1/activity/invite",
            "device_id": xid,
            "captcha_token": accessToken,
            "meta": {
                "captcha_sign": "1." + sign,
                "client_version": "undefined",
                "package_name": "mypikpak.com",
                "user_id": sub,
                "timestamp": t
            },
        }
        // 将请求体转换为字符串形式
        const bodyString = JSON.stringify(body);
        console.log(body)
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'user.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN',
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'MainWindow Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-device-model': 'electron%2F18.3.15',
            'x-device-name': 'PC-Electron',
            'x-device-sign': 'wdi10.ce6450a2dc704cd49f0be1c4eca40053xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'x-net-work-type': 'NONE',
            'x-os-version': 'Win32',
            'x-platform-version': '1',
            'x-protocol-version': '301',
            'x-provider-name': 'NONE',
            'x-sdk-version': '6.0.0'
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const responseData = await response.json()
            console.log(responseData)
            resolve(responseData)
        }catch (error) {
            reject(error)
        }
    })
}

async function invite(accessToken, captcha, xid) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://api-drive.mypikpak.com/vip/v1/activity/invite'
        const body = {
            "apk_extra": {
                "invite_code": ""
            }
        }
        const bodyString = JSON.stringify(body);
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'api-drive.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN',
            'authorization': 'Bearer ' + accessToken,
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-captcha-token': captcha,
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-system-language': 'zh-CN'
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const responseData = await response.json()
            console.log(responseData)
            resolve(responseData)
        }catch (error) {
            reject(error)
        }
    })
}

async function activationCode(accessToken, captcha, xid, inCode) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://api-drive.mypikpak.com/vip/v1/order/activation-code';
        const body = {
            "activation_code": inCode,
            "page": "invite"
        }
        // 将请求体转换为字符串形式
        const bodyString = JSON.stringify(body);
        // 计算请求体长度（字节数）
        const encoder = new TextEncoder();
        const bodyLength = encoder.encode(bodyString).byteLength;
        const headers = {
            'host': 'api-drive.mypikpak.com',
            'content-length': bodyLength,
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN',
            'authorization': 'Bearer ' + accessToken,
            'referer': 'https://pc.mypikpak.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) PikPak/2.3.2.4101 Chrome/100.0.4896.160 Electron/18.3.15 Safari/537.36',
            'content-type': 'application/json',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-captcha-token': captcha,
            'x-client-id': 'YvtoWO6GNHiuCl7x',
            'x-client-version': '2.3.2.4101',
            'x-device-id': xid,
            'x-system-language': 'zh-CN'
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const responseData = await response.json()
            console.log(responseData)
            resolve(responseData)
        } catch (error) {
            reject(error)
        }
    })
}


//   主函数及执行
async function start(inCode){
    const start_time = new Date().getTime();
    console.log(start_time)
    return new Promise(async (resolve, reject) => {
        try {
            const mail = await getMail()
            const xid = uuidv4().replace(/-/g, '');
            const Init = await init(xid, mail['mail'])
            const Image = await getImage(xid)
            const Newtoken = await getNewToken(Image, xid, Init['captcha_token'])
            const Verification = await verification(Newtoken['captcha_token'], xid, mail['mail'])
            const Code = await getCode(mail['jwt'])
            const Verify = await verify(xid, Verification['verification_id'], Code)
            const SignUp = await signup(xid, mail['mail'], Code, Verify['verification_token'])
            const t = String(Date.now())
            const sign = await getSign(xid, t)
            const Init1 = await init1(xid, SignUp['access_token'], SignUp['sub'], sign, t)
            const Invite = await invite(SignUp['access_token'], Init1['captcha_token'], xid)
            const final = await activationCode(SignUp['access_token'], Init1['captcha_token'], xid, inCode)
            const end_time = new Date().getTime();
            console.log(end_time)
            const run_time = parseFloat(((end_time - start_time)/1000).toFixed(2))
            resolve({add_days:final['add_days'],
                time:run_time});
        } catch (error) {
            const end_time = new Date().getTime();
            console.log(end_time)
            const run_time = parseFloat(((end_time - start_time)/1000).toFixed(2))
            reject({add_days:1,
                time:run_time});
        }
    });
}

