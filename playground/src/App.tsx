import { useState } from 'react'
import { AdaptiveHoverPanel } from '@adaptive-hover/react'

type TabKey = 'button' | 'image' | 'table'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'button', label: '基础按钮' },
  { key: 'image', label: '图片卡片' },
  { key: 'table', label: '表格行' },
]

export function App() {
  const [tab, setTab] = useState<TabKey>('button')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Adaptive Hover Panel — Playground</h1>
        <p>把鼠标拖到屏幕四个角落，观察面板方向是否自适应。</p>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            data-active={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="section">
        {tab === 'button' && <ButtonDemo />}
        {tab === 'image' && <ImageDemo />}
        {tab === 'table' && <TableDemo />}
      </section>
    </div>
  )
}

function ButtonDemo() {
  return (
    <>
      <div className="trigger-grid">
        <AdaptiveHoverPanel
          panel={
            <div className="preview-text">
              <strong>用户信息</strong>
              <p>这是 hover 出现的预览面板，按鼠标四象限自适应方向。</p>
            </div>
          }
        >
          <button type="button" className="demo-trigger">
            Hover 我（左上区按钮）
          </button>
        </AdaptiveHoverPanel>

        <AdaptiveHoverPanel
          panel={
            <div className="preview-text">
              <strong>另一个面板</strong>
              <p>不同 trigger 之间互不影响。</p>
            </div>
          }
        >
          <button type="button" className="demo-trigger">
            Hover 我（右上区按钮）
          </button>
        </AdaptiveHoverPanel>

        <AdaptiveHoverPanel
          panel={
            <div className="preview-text">
              <strong>第三个面板</strong>
              <p>四角验证：左下 → 面板出现在右上。</p>
            </div>
          }
        >
          <button type="button" className="demo-trigger">
            Hover 我（左下区按钮）
          </button>
        </AdaptiveHoverPanel>

        <AdaptiveHoverPanel
          panel={
            <div className="preview-text">
              <strong>第四个面板</strong>
              <p>四角验证：右下 → 面板出现在左上。</p>
            </div>
          }
        >
          <button type="button" className="demo-trigger">
            Hover 我（右下区按钮）
          </button>
        </AdaptiveHoverPanel>
      </div>
      <p className="hint">提示：把窗口缩到 480px 宽测试边界。</p>
    </>
  )
}

function ImageDemo() {
  const items = [
    { id: 1, seed: 'mountain' },
    { id: 2, seed: 'forest' },
    { id: 3, seed: 'ocean' },
    { id: 4, seed: 'city' },
  ]
  return (
    <>
      <div className="trigger-grid">
        {items.map((it) => (
          <AdaptiveHoverPanel
            key={it.id}
            minWidth={360}
            minHeight={240}
            panel={
              <img
                className="preview-image"
                src={`https://picsum.photos/seed/${it.seed}/720/480`}
                alt={`${it.seed} large`}
              />
            }
          >
            <img
              className="demo-thumb"
              src={`https://picsum.photos/seed/${it.seed}/220/120`}
              alt={`${it.seed} thumb`}
            />
          </AdaptiveHoverPanel>
        ))}
      </div>
      <p className="hint">缩略图来自 picsum.photos，hover 后显示大图预览。</p>
    </>
  )
}

interface Row {
  id: string
  user: string
  action: string
  status: '成功' | '失败' | '待处理'
  detail: string
}

const ROWS: Row[] = [
  { id: '#001', user: 'alice', action: '登录', status: '成功', detail: '从 192.168.1.10 登录，2FA 校验通过。' },
  { id: '#002', user: 'bob', action: '导出报表', status: '成功', detail: '导出 2026-Q1 财务报表，共 42 行。' },
  { id: '#003', user: 'carol', action: '修改权限', status: '待处理', detail: '将 dev-team 角色升级为 admin，等待主管审批。' },
  { id: '#004', user: 'dave', action: '删除文件', status: '失败', detail: '尝试删除 /var/log/audit.log，权限不足。' },
  { id: '#005', user: 'eve', action: '上传文件', status: '成功', detail: 'invoice-2026-05.pdf，2.4 MB。' },
]

function TableDemo() {
  return (
    <>
      <table className="demo-table">
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
      <p className="hint">hover 任意一行，预览详情卡片。</p>
    </>
  )
}
