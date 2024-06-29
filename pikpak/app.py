from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def homepage():
    return 'API is running...'

@app.route('/api/getNum', methods=['POST'])
def get_num():
    data = request.get_json()
    xid = data.get('xid')
    result = data.get('data')
    
    # 假设 pass_verify 是一个函数，这里返回一个示例值
    num = pass_verify(xid, result['pid'], result['traceid'], result)
    return jsonify({'num': num})

def pass_verify(xid, pid, traceid, result):
    # 示例函数，返回固定值
    return 42

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
   
