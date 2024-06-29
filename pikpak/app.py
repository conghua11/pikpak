from flask import Flask, jsonify, request
import cv2
import numpy as np
import time
from functools import partial
from multiprocessing import Pool
import json
from tqdm import trange
import requests

app = Flask(__name__)

@app.route('/')
def homepage():
  return 'API运行中...'

@app.route('/api/getNum', methods=['POST'])
def getNum():
  data = request.get_json()
  print('接收的数据:', data)
  xid = data.get('xid')
  result = data.get('data')
  
  num = pass_verify(xid, result['pid'], result['traceid'], result)
  return jsonify({'num': num})

def image_assemble(sum_rows, sum_cols, channels, part_num):
  # 初始化一个全零的3维矩阵，用于存储拼接后的图像
  final_matrix = np.zeros((sum_rows, sum_cols, channels), np.uint8)

  # 将part_num中的图像按照指定的位置拼接到final_matrix中
  # 第一排
  final_matrix[0:75, 0:150] = part_num[0]
  final_matrix[0:75, 150:300] = part_num[1]
  final_matrix[0:75, 300:450] = part_num[2]
  final_matrix[0:75, 450:600] = part_num[3]

  # 第二排
  final_matrix[75:150, 0:150] = part_num[4]
  final_matrix[75:150, 150:300] = part_num[5]
  final_matrix[75:150, 300:450] = part_num[6]
  final_matrix[75:150, 450:600] = part_num[7]

  # 第三排
  final_matrix[150:225, 0:150] = part_num[8]
  final_matrix[150:225, 150:300] = part_num[9]
  final_matrix[150:225, 300:450] = part_num[10]
  final_matrix[150:225, 450:600] = part_num[11]

  # 第四排
  final_matrix[225:300, 0:150] = part_num[12]
  final_matrix[225:300, 150:300] = part_num[13]
  final_matrix[225:300, 300:450] = part_num[14]
  final_matrix[225:300, 450:600] = part_num[15]
  # 返回拼接后的图像
  return final_matrix


def getSize(p):
  # 获取输入矩阵的行数、列数和通道数
  sum_rows = p.shape[0]
  sum_cols = p.shape[1]
  channels = p.shape[2]
  return sum_rows, sum_cols, channels


def get_img(deviceid, pid, traceid):
  """
  根据设备id、pid、traceid获取图片
  :param deviceid: 设备id
  :param pid: 图片id
  :param traceid: traceid
  :return: 图片内容
  """
  # 拼接url
  url = 'https://user.mypikpak.com/pzzl/image?deviceid=' + deviceid + '&pid=' + pid + '&traceid=' + traceid
  # 发送get请求
  response = requests.get(url)
  # 返回图篇内容
  return response.content


def re_image_assemble(part, img):
  # 获取图片的每一部分
  part1 = img[0:75, 0:150]
  part2 = img[0:75, 150:300]
  part3 = img[0:75, 300:450]
  part4 = img[0:75, 450:600]
  # 第二排
  part5 = img[75:150, 0:150]
  part6 = img[75:150, 150:300]
  part7 = img[75:150, 300:450]
  part8 = img[75:150, 450:600]
  # 第三排
  part9 = img[150:225, 0:150]
  part10 = img[150:225, 150:300]
  part11 = img[150:225, 300:450]
  part12 = img[150:225, 450:600]
  # 第四排
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


# 定义一个函数，用于处理图像
def corp_image(img):
  # 将图像转换为灰度图像
  img2 = img.sum(axis=2)
  # 获取图像的行数和列数
  (row, col) = img2.shape
  # 初始化行和列的上下界
  row_top = 0
  raw_down = 0
  col_top = 0
  col_down = 0
  # 遍历行，找到行上下界
  for r in range(0, row):
      if img2.sum(axis=1)[r] < 740 * col:
          row_top = r
          break

  for r in range(row - 1, 0, -1):
      if img2.sum(axis=1)[r] < 740 * col:
          raw_down = r
          break

  # 遍历列，找到列上下界
  for c in range(0, col):
      if img2.sum(axis=0)[c] < 740 * row:
          col_top = c
          break

  for c in range(col - 1, 0, -1):
      if img2.sum(axis=0)[c] < 740 * row:
          col_down = c
          break

  # 裁剪图像，并返回新的图像
  new_img = img[row_top:raw_down + 1, col_top:col_down + 1, 0:3]
  return new_img


# 定义一个函数，用于获取处理图像
def get_reimage(images):
  # 定义一个空字典，用于存储裁剪后的图像
  cropped_img = {}
  # 遍历images中的每一张图像
  for i in range(16):
      # 对图像进行裁剪
      re_num = corp_image(images[i])
      # 将裁剪后的图像resize为150x75的大小
      cropped_img[i] = cv2.resize(re_num, (150, 75))
  # 返回裁剪后的图像字典
  return cropped_img

def start_pass_verify(sum_rows, sum_cols, channels, img, result, i):
  # 获取结果中的frames部分
  part_1 = result["frames"][i]['matrix'][0]
  part_2 = result["frames"][i]['matrix'][1]
  part_3 = result["frames"][i]['matrix'][2]
  part_4 = result["frames"][i]['matrix'][3]
  # 将四个部分合并
  part = []
  part.extend(part_1)
  part.extend(part_2)
  part.extend(part_3)
  part.extend(part_4)
  # 将合并后的部分重新组装
  start_time = time.time()
  part_num = re_image_assemble(part, img)
  # 获取重新组装后的图片
  part_num = get_reimage(part_num)
  # 将重新组装后的图片按照sum_rows和sum_cols进行组装
  f = image_assemble(sum_rows, sum_cols, channels, part_num)
  # 将组装后的图片转换为灰度图
  gray = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
  # 对灰度图进行边缘检测
  edges = cv2.Canny(gray, 100, 200, apertureSize=3)
  # 对边缘检测后的图片进行霍夫变换
  # lines = cv2.HoughLinesP(edges, 0.001, np.pi / 180, 1, minLineLength=0, maxLineGap=0)
  lsd = cv2.createLineSegmentDetector(0, scale=1.0, sigma_scale=0.6, quant=2.0, ang_th=90,)
  # 执行检测结果
  lines = lsd.detect(edges)[0]
  # 返回线段数量
  return len(lines)


def pass_verify(deviceid, pid, traceid, result):
  # 创建一个进程池,有几核就填几，不要超过5，除非你的内存够大(20g只能开到5，否则内存溢出)，理论上12进程一起2s解决!!!!!
  # replit 是一核，填1，不然卡死!!!!
  pool = Pool(12)
  try:
      # 获取验证码图片
      img = get_img(deviceid, pid, traceid)
      # 获取图片大小
      start_time = time.time()
      img_re = cv2.imdecode(np.frombuffer(img, np.uint8), cv2.IMREAD_COLOR)
      finded = False
      sum_rows, sum_cols, channels = getSize(img_re)
  except Exception as e:
      print(e)
  else:
      # 分配进程
      data_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      start_pass_verify_re = partial(start_pass_verify, sum_rows)
      start_pass_verify_re = partial(start_pass_verify_re, sum_cols)
      start_pass_verify_re = partial(start_pass_verify_re, channels)
      start_pass_verify_re = partial(start_pass_verify_re, img_re)
      start_pass_verify_re = partial(start_pass_verify_re, result)
      len_num = []
      data_i = []
      results = []
      total = trange(len(data_list))
      for data in data_list:
          # 等待任务执行完成
          result = pool.apply_async(start_pass_verify_re, args=(data,), callback=lambda _: total.update(1),)
          data_i.append(data)
          results.append(result)
      pool.close()
      pool.join()
      for data in data_i:
          len_num.append(results[data].get())
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
      print(f'滑块识别时间{time.time() - start_time}')
      print('测试次数', data, '最终状态', finded)
      return num
if __name__ == '__main__':
  app.run(host='0.0.0.0', port=5000)
