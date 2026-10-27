import { useMemo, useState } from 'react'

type Region = {
  name: string
  values: number[]
}

type ScaleMode = 'absolute' | 'zoom' | 'index'

const years = [2021, 2022, 2023, 2024, 2025]

const regions: Region[] = [
  { name: '전국', values: [515.2, 514.6, 515.4, 515.7, 515.7] },
  { name: '서울특별시', values: [15650.1, 15560.7, 15506.4, 15425, 15390.5] },
  { name: '부산광역시', values: [4316.4, 4272.8, 4252, 4222.9, 4192.7] },
  { name: '대구광역시', values: [2702.2, 2673.7, 1586.7, 1580.1, 1576.1] },
  { name: '인천광역시', values: [2772.8, 2801.3, 2835.7, 2859.3, 2892.4] },
  { name: '광주광역시', values: [2944, 2931.9, 2908.5, 2882.8, 2858.4] },
  { name: '대전광역시', values: [2742.8, 2730.7, 2724, 2718.1, 2721.8] },
  { name: '울산광역시', values: [1055, 1044.9, 1042, 1041.4, 1038.2] },
  { name: '세종특별자치시', values: [787.7, 822.9, 830.7, 839, 844] },
  { name: '경기도', values: [1338.9, 1344.9, 1354.5, 1364, 1368.4] },
  { name: '강원특별자치도', values: [90.4, 90.8, 90.8, 90.5, 90.2] },
  { name: '충청북도', values: [219.4, 219.4, 221.6, 222.3, 223.7] },
  { name: '충청남도', values: [263.8, 265.9, 268.7, 271.4, 272.7] },
  { name: '전북특별자치도', values: [221.4, 219.8, 219.1, 217.8, 216.9] },
  { name: '전라남도', values: [143.9, 143.3, 143.7, 143.8, 143.8] },
  { name: '경상북도', values: [138.4, 137.7, 140.6, 139.9, 139.3] },
  { name: '경상남도', values: [313.6, 311.2, 310.3, 309.6, 308.5] },
  { name: '제주특별자치도', values: [363.8, 365.6, 365.8, 364.7, 361.8] },
]

const colors = [
  '#2764E7',
  '#E15554',
  '#14A38B',
  '#8B5CF6',
  '#E99035',
  '#0891B2',
  '#D946A6',
  '#65A30D',
  '#475569',
  '#F43F5E',
  '#0D9488',
  '#7C3AED',
  '#CA8A04',
  '#0284C7',
  '#C026D3',
  '#4D7C0F',
  '#334155',
  '#EA580C',
]

const formatNumber = (value: number) =>
  value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })

function LineChart({
  data,
  normalized = false,
  mode = 'absolute',
}: {
  data: Region[]
  normalized?: boolean
  mode?: ScaleMode
}) {
  const width = 900
  const height = 330
  const padding = { top: 24, right: 24, bottom: 42, left: 74 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const series = data.map((region) => {
    if (normalized) {
      const min = Math.min(...region.values)
      const max = Math.max(...region.values)
      return {
        ...region,
        values: region.values.map((value) => (max === min ? 0.5 : (value - min) / (max - min))),
      }
    }
    if (mode === 'index') {
      const base = region.values[0]
      return { ...region, values: region.values.map((value) => (value / base) * 100) }
    }
    return region
  })

  const allValues = series.flatMap((region) => region.values)
  const rawMax = Math.max(...allValues, 1)
  const rawMin = Math.min(...allValues)
  const range = Math.max(rawMax - rawMin, rawMax * 0.01, 1)
  const yMin = normalized ? 0 : mode === 'zoom' || mode === 'index' ? rawMin - range * 0.1 : 0
  const yMax = normalized
    ? 1
    : mode === 'zoom' || mode === 'index'
      ? rawMax + range * 0.1
      : Math.ceil(rawMax / 1000) * 1000 || 1
  const ticks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) / 4) * index)
  const x = (index: number) => padding.left + (plotWidth / (years.length - 1)) * index
  const y = (value: number) =>
    padding.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight

  return (
    <div className="chart-scroll">
      <svg
        className="chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={normalized ? '지역별 정규화 인구밀도 추이' : '지역별 인구밀도 추이'}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              className="grid-line"
            />
            <text x={padding.left - 14} y={y(tick) + 4} textAnchor="end" className="axis-label">
              {normalized ? tick.toFixed(2) : mode === 'index' ? tick.toFixed(1) : formatNumber(tick)}
            </text>
          </g>
        ))}
        {years.map((year, index) => (
          <text key={year} x={x(index)} y={height - 14} textAnchor="middle" className="axis-label">
            {year}
          </text>
        ))}
        {series.map((region) => {
          const regionIndex = regions.findIndex((item) => item.name === region.name)
          const color = colors[regionIndex % colors.length]
          const points = region.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
          return (
            <g key={region.name}>
              <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
              {region.values.map((value, index) => (
                <circle key={years[index]} cx={x(index)} cy={y(value)} r="4" fill={color} stroke="white" strokeWidth="2">
                  <title>
                    {region.name} · {years[index]}년 ·{' '}
                    {normalized
                      ? value.toFixed(2)
                      : mode === 'index'
                        ? `${value.toFixed(1)} (2021=100)`
                        : `${formatNumber(value)}명/㎢`}
                  </title>
                </circle>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>(['전국', '서울특별시', '경기도'])
  const [scaleMode, setScaleMode] = useState<ScaleMode>('zoom')

  const filtered = useMemo(
    () => regions.filter((region) => region.name.includes(query.trim())),
    [query],
  )
  const selectedData = regions.filter((region) => selected.includes(region.name))

  const toggleRegion = (name: string) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )
  }

  return (
    <main>
      <header className="hero">
        <div className="eyebrow">KOSIS DATA EXPLORER</div>
        <h1>지역별 인구밀도 변화</h1>
        <p>인구주택총조사 기준 · 2021–2025 · 단위 명/㎢</p>
      </header>

      <section className="region-panel" aria-labelledby="region-title">
        <div className="panel-heading">
          <div>
            <span className="step">01</span>
            <h2 id="region-title">비교할 지역을 선택하세요</h2>
          </div>
          <button className="text-button" onClick={() => setSelected([])} disabled={!selected.length}>
            선택 초기화
          </button>
        </div>

        <label className="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="지역명 검색 (예: 서울, 충청)"
          />
          {query && (
            <button aria-label="검색어 지우기" onClick={() => setQuery('')}>
              ×
            </button>
          )}
        </label>

        <div className="region-list">
          {filtered.map((region) => {
            const active = selected.includes(region.name)
            const regionIndex = regions.indexOf(region)
            return (
              <button
                key={region.name}
                className={`region-chip ${active ? 'active' : ''}`}
                onClick={() => toggleRegion(region.name)}
                aria-pressed={active}
                style={active ? { '--chip-color': colors[regionIndex] } as React.CSSProperties : undefined}
              >
                <span className="chip-dot" />
                {region.name}
                {active && <span className="check">✓</span>}
              </button>
            )
          })}
          {!filtered.length && <p className="empty-search">검색 결과가 없습니다.</p>}
        </div>
      </section>

      {selectedData.length ? (
        <div className="charts">
          <section className="chart-card">
            <div className="card-heading">
              <div>
                <span className="step">02</span>
                <h2>연도별 인구밀도 추이</h2>
              </div>
              <span className="unit">{scaleMode === 'index' ? '2021 = 100' : '명/㎢'}</span>
            </div>
            <div className="chart-controls">
              <p className="description">
                {scaleMode === 'absolute' && '0부터 시작하는 동일 축으로 지역 간 절대 밀도를 비교합니다.'}
                {scaleMode === 'zoom' && '선택한 범위에 축을 맞춰 연도별 미세한 차이를 확대합니다.'}
                {scaleMode === 'index' && '2021년을 100으로 두고 지역별 증감률을 비교합니다.'}
              </p>
              <div className="segment-control" aria-label="그래프 축 표시 방식">
                {[
                  ['absolute', '전체 비교'],
                  ['zoom', '변화 확대'],
                  ['index', '2021=100'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={scaleMode === value ? 'active' : ''}
                    onClick={() => setScaleMode(value as ScaleMode)}
                    aria-pressed={scaleMode === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {scaleMode === 'zoom' && (
              <p className="axis-note">축이 0부터 시작하지 않아 실제 변화보다 크게 보일 수 있습니다.</p>
            )}
            <LineChart data={selectedData} mode={scaleMode} />
          </section>

          <section className="chart-card">
            <div className="card-heading">
              <div>
                <span className="step">03</span>
                <h2>정규화 인구밀도 추이</h2>
              </div>
              <span className="unit">0 — 1</span>
            </div>
            <p className="description">
              지역별 최솟값을 0, 최댓값을 1로 변환해 변화의 방향과 폭을 비교합니다.
            </p>
            <LineChart data={selectedData} normalized />
          </section>
        </div>
      ) : (
        <section className="no-selection">
          <strong>표시할 지역이 없습니다</strong>
          <p>위 검색 영역에서 하나 이상의 지역을 선택해 주세요.</p>
        </section>
      )}

      <footer>출처: 통계청 인구밀도(인구주택총조사 기준) — 시도</footer>
    </main>
  )
}
