import pandas as pd

# 读取 CSV 文件，从第二行开始

df = pd.read_csv('信用卡数据.csv', skiprows=1, encoding='gbk')

# 查看缺失值
missing_values = df.isnull().sum()

print("缺失值情况：")
print(missing_values)