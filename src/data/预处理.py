import pandas as pd

# 读取 CSV 文件，从第二行开始
df = pd.read_csv('信用卡源数据.csv', skiprows=1, encoding='gbk')

# 查看缺失值
missing_values = df.isnull().sum()
print(missing_values)

# 删除 CREDIT_LIMIT 为空的行
df = df.dropna(subset=['CREDIT_LIMIT'])

# 将 MINIMUM_PAYMENTS 为 NaN 的值填充为 0
df = df.fillna({'MINIMUM_PAYMENTS': 0})

# 查看缺失值
missing_values = df.isnull().sum()

print("缺失值情况：")
print(missing_values)
df.to_csv('信用卡数据.csv', index=False, encoding='gbk')