import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'
import './_shared/demo.css'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'AdaptiveHoverPanel/ImagePreview',
  component: AdaptiveHoverPanel,
  parameters: { layout: 'centered' },
}

export default meta

type Story = StoryObj<typeof AdaptiveHoverPanel>

const SEEDS = ['mountain', 'forest', 'ocean', 'city']

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 24,
      }}
    >
      {SEEDS.map((seed) => (
        <AdaptiveHoverPanel
          key={seed}
          minWidth={360}
          minHeight={240}
          panel={
            <img
              className="preview-image"
              src={`https://picsum.photos/seed/${seed}/720/480`}
              alt={`${seed} large preview`}
            />
          }
        >
          <img
            className="demo-thumb"
            src={`https://picsum.photos/seed/${seed}/220/120`}
            alt={`${seed} thumbnail`}
          />
        </AdaptiveHoverPanel>
      ))}
    </div>
  ),
}
