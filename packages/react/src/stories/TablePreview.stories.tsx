import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'
import './_shared/demo.css'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'AdaptiveHoverPanel/TablePreview',
  component: AdaptiveHoverPanel,
  parameters: { layout: 'centered' },
}

export default meta

type Story = StoryObj<typeof AdaptiveHoverPanel>

interface Row {
  id: string
  user: string
  action: string
  status: '成功' | '失败' | '待处理'
  detail: string
}

const ROWS: Row[] = [
  {
    id: '#001',
    user: 'alice',
    action: '登录',
    status: '成功',
    detail: '从 192.168.1.10 登录，2FA 校验通过。',
  },
  {
    id: '#002',
    user: 'bob',
    action: '导出报表',
    status: '成功',
    detail: '导出 2026-Q1 财务报表，共 42 行。',
  },
  {
    id: '#003',
    user: 'carol',
    action: '修改权限',
    status: '待处理',
    detail: '将 dev-team 角色升级为 admin，等待主管审批。',
  },
  {
    id: '#004',
    user: 'dave',
    action: '删除文件',
    status: '失败',
    detail: '尝试删除 /var/log/audit.log，权限不足。',
  },
  {
    id: '#005',
    user: 'eve',
    action: '上传文件',
    status: '成功',
    detail: 'invoice-2026-05.pdf，2.4 MB。',
  },
]

export const Rows: Story = {
  render: () => (
    <table className="demo-table" style={{ minWidth: 480 }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>用户</th>
          <th>操作</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <AdaptiveHoverPanel
            key={r.id}
            panel={
              <div className="preview-detail">
                <h3>{r.action} 详情</h3>
                <dl>
                  <dt>ID</dt>
                  <dd>{r.id}</dd>
                  <dt>用户</dt>
                  <dd>{r.user}</dd>
                  <dt>状态</dt>
                  <dd>{r.status}</dd>
                  <dt>详情</dt>
                  <dd>{r.detail}</dd>
                </dl>
              </div>
            }
          >
            <tr>
              <td>{r.id}</td>
              <td>{r.user}</td>
              <td>{r.action}</td>
              <td>{r.status}</td>
            </tr>
          </AdaptiveHoverPanel>
        ))}
      </tbody>
    </table>
  ),
}
