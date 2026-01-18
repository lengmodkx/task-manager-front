# 用户管理功能设计

日期: 2026-01-18

## 概述

为管理员添加完整的用户管理功能，包括查看用户列表、修改角色、禁用/启用用户、重置密码和删除用户（软删除）。

## 数据库变更

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  is_active BOOLEAN DEFAULT true;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  last_login_at TIMESTAMPTZ;
```

## 页面设计

**路径**: `/admin/users`

**列表字段**:
- 邮箱
- 昵称
- 角色 (admin/member)
- 邀请码来源
- 任务数
- 注册时间
- 最后登录时间
- 状态 (正常/已禁用)
- 操作菜单

**筛选功能**:
- 按角色筛选
- 按状态筛选

**操作**:
- 修改角色
- 重置密码
- 禁用/启用
- 删除（软删除，二次确认）

## API 设计

文件: `lib/actions/users.ts`

- `getUsers(filters?)` - 获取用户列表
- `updateUserRole(userId, role)` - 修改角色
- `toggleUserStatus(userId, isActive)` - 禁用/启用
- `resetUserPassword(userId)` - 重置密码
- `deleteUser(userId)` - 软删除

**权限控制**:
- 需验证 admin 权限
- 不能对自己执行禁用/删除
- 不能删除其他 admin
