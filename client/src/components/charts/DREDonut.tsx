import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Label } from 'recharts';

export type DREDonutProps = {
  receitas: number;
  despesas: number;
  resultado: number;
  margemPct: number; // 0-100
  viewFocus?: 'receitas' | 'despesas' | 'ambos';
  onFocusChange?: (v: 'receitas' | 'despesas' | 'ambos') => void;
};

const DREDonut: React.FC<DREDonutProps> = ({
  receitas,
  despesas,
  resultado,
  margemPct,
  viewFocus = 'ambos',
  onFocusChange,
}) => {
  const hasData = (receitas + despesas) > 0;

  const data = [
    { name: 'Receitas', value: receitas },
    { name: 'Despesas', value: despesas },
  ];

  const colors = {
    receitas: '#10b981', // emerald-500
    despesas: '#ef4444', // red-500
    trackLight: '#e5e7eb', // gray-200
    trackDark: '#1f2937', // gray-800
    centerPos: '#10b981',
    centerNeg: '#ef4444',
  };

  const handleSliceClick = (_entry: any, index: number) => {
    if (!onFocusChange) return;
    if (index === 0) onFocusChange('receitas');
    if (index === 1) onFocusChange('despesas');
  };

  const focusedOpacity = (idx: number) => {
    if (viewFocus === 'ambos') return 1;
    if (viewFocus === 'receitas') return idx === 0 ? 1 : 0.25;
    if (viewFocus === 'despesas') return idx === 1 ? 1 : 0.25;
    return 1;
  };

  return (
    <div className="relative w-full h-full">
      {!hasData ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Sem dados</div>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              isAnimationActive={true}
              animationDuration={650}
              onClick={handleSliceClick}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? colors.receitas : colors.despesas}
                  stroke={index === 0 ? colors.receitas : colors.despesas}
                  strokeWidth={2}
                  opacity={focusedOpacity(index)}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.25))' }}
                />
              ))}
              <Label
                position="center"
                content={() => {
                  const positive = resultado >= 0;
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Resultado</div>
                      <div style={{ fontWeight: 600, fontSize: 16, color: positive ? colors.centerPos : colors.centerNeg }}>
                        {resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>Margem {Math.round(margemPct)}%</div>
                    </div>
                  );
                }}
              />
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [
                Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                name,
              ]}
            />
            {/* Track visual atrás do donut, respeitando dark mode via CSS do container */}
            <svg width={0} height={0}>
              {/* placeholder para evitar warning de container vazio */}
            </svg>

          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DREDonut;