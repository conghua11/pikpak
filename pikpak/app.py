from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import time
from functools import partial
from multiprocessing import Pool
import json
import requests

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    param1 = data.get('param1')
    print(param1)
    param2 = data.get('param2')
    print(param2)
    # 将 param2 解析为字典
    # param2 = json.loads(param2) 
    num = pass_verify(param1, param2['pid'], param2['traceid'], param2)
    return jsonify({'num': num})

def image_assemble(sum_rows, sum_cols, channels, part_num):
    final_matrix = np.zeros((sum_rows, sum_cols, channels), np.uint8)
    final_matrix[0:75, 0:150] = part_num[0]
    final_matrix[0:75, 150:300] = part_num[1]
    final_matrix[0:75, 300:450] = part_num[2]
    final_matrix[0:75, 450:600] = part_num[3]
    final_matrix[75:150, 0:150] = part_num[4]
    final_matrix[75:150, 150:300] = part_num[5]
    final_matrix[75:150, 300:450] = part_num[6]
    final_matrix[75:150, 450:600] = part_num[7]
    final_matrix[150:225, 0:150] = part_num[8]
    final_matrix[150:225, 150:300] = part_num[9]
    final_matrix[150:225, 300:450] = part_num[10]
    final_matrix[150:225, 450:600] = part_num[11]
    final_matrix[225:300, 0:150] = part_num[12]
    final_matrix[225:300, 150:300] = part_num[13]
    final_matrix[225:300, 300:450] = part_num[14]
    final_matrix[225:300, 450:600] = part_num[15]
    return final_matrix


def getSize(p):
    sum_rows = p.shape[0]
    sum_cols = p.shape[1]
    channels = p.shape[2]
    return sum_rows, sum_cols, channels


def get_img(deviceid, pid, traceid):
    url = 'https://user.mypikpak.com/pzzl/image?deviceid=' + deviceid + '&pid=' + pid + '&traceid=' + traceid
    response = requests.get(url)
    return response.content


def re_image_assemble(part, img):
    part1 = img[0:75, 0:150]
    part2 = img[0:75, 150:300]
    part3 = img[0:75, 300:450]
    part4 = img[0:75, 450:600]
    part5 = img[75:150, 0:150]
    part6 = img[75:150, 150:300]
    part7 = img[75:150, 300:450]
    part8 = img[75:150, 450:600]
    part9 = img[150:225, 0:150]
    part10 = img[150:225, 150:300]
    part11 = img[150:225, 300:450]
    part12 = img[150:225, 450:600]
    part13 = img[225:300, 0:150]
    part14 = img[225:300, 150:300]
    part15 = img[225:300, 300:450]
    part16 = img[225:300, 450:600]
    part_nu = []
    for i, j in enumerate(part):
        if j == '0,0':
            part_nu.append(part1)
        if j == '0,1':
            part_nu.append(part5)
        if j == '0,2':
            part_nu.append(part9)
        if j == '0,3':
            part_nu.append(part13)
        if j == '1,0':
            part_nu.append(part2)
        if j == '1,1':
            part_nu.append(part6)
        if j == '1,2':
            part_nu.append(part10)
        if j == '1,3':
            part_nu.append(part14)
        if j == '2,0':
            part_nu.append(part3)
        if j == '2,1':
            part_nu.append(part7)
        if j == '2,2':
            part_nu.append(part11)
        if j == '2,3':
            part_nu.append(part15)
        if j == '3,0':
            part_nu.append(part4)
        if j == '3,1':
            part_nu.append(part8)
        if j == '3,2':
            part_nu.append(part12)
        if j == '3,3':
            part_nu.append(part16)
    return part_nu


def corp_image(img):
    img2 = img.sum(axis=2)
    (row, col) = img2.shape
    row_top = 0
    raw_down = 0
    col_top = 0
    col_down = 0
    for r in range(0, row):
        if img2.sum(axis=1)[r] < 740 * col:
            row_top = r
            break
    for r in range(row - 1, 0, -1):
        if img2.sum(axis=1)[r] < 740 * col:
            raw_down = r
            break
    for c in range(0, col):
        if img2.sum(axis=0)[c] < 740 * row:
            col_top = c
            break
    for c in range(col - 1, 0, -1):
        if img2.sum(axis=0)[c] < 740 * row:
            col_down = c
            break
    new_img = img[row_top:raw_down + 1, col_top:col_down + 1, 0:3]
    return new_img


def get_reimage(images):
    cropped_img = {}
    for i in range(16):
        re_num = corp_image(images[i])
        cropped_img[i] = cv2.resize(re_num, (150, 75))
    return cropped_img


def start_pass_verify(sum_rows, sum_cols, channels, img, result, i):
    part_1 = result["frames"][i]['matrix'][0]
    part_2 = result["frames"][i]['matrix'][1]
    part_3 = result["frames"][i]['matrix'][2]
    part_4 = result["frames"][i]['matrix'][3]
    part = []
    part.extend(part_1)
    part.extend(part_2)
    part.extend(part_3)
    part.extend(part_4)
    start_time = time.time()
    part_num = re_image_assemble(part, img)
    part_num = get_reimage(part_num)
    f = image_assemble(sum_rows, sum_cols, channels, part_num)
    gray = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200, apertureSize=3)
    lsd = cv2.createLineSegmentDetector(0, scale=3.0, sigma_scale=0.6, quant=2.0, ang_th=90)
    lines = lsd.detect(edges)[0]
    return len(lines)


def pass_verify(deviceid, pid, traceid, result):
    pool = Pool(12)
    try:
        start_time = time.time()
        img = get_img(deviceid, pid, traceid)
        img_re = cv2.imdecode(np.frombuffer(img, np.uint8), cv2.IMREAD_COLOR)
        finded = False
        sum_rows, sum_cols, channels = getSize(img_re)
    except Exception as e:
        print(e)
    else:
        data_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        start_pass_verify_re = partial(start_pass_verify, sum_rows, sum_cols, channels, img_re, result)
        len_num = []
        results = []
        for data in data_list:
            result = pool.apply_async(start_pass_verify_re, args=(data,))
            results.append(result)
        pool.close()
        pool.join()
        for result in results:
            len_num.append(result.get())
        for data, line in enumerate(len_num):
            if line is None:
                num = data
            else:
                if data == 0:
                    num = 0
                    lines = line
                if lines <= line:
                    finded = True
                elif lines > line:
                    lines = line
                    num = data
            data += 1
        print(f'滑块识别时间: {(time.time() - start_time):.2f} 秒')
        return num

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
