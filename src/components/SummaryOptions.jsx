import { Clock, AlignLeft, List } from 'lucide-react';

export default function SummaryOptionsComponent({ options, onChange, disabled }) {
  const handleLengthChange = (length) => {
    onChange({ ...options, length });
  };

  const handleStyleChange = (style) => {
    onChange({ ...options, style });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 dark:bg-gray-800/80 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <Clock className="w-6 h-6 mr-3 text-indigo-500" />
        Summary Options
      </h3>

      
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary Length</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'short', label: 'Short', desc: '2-3 sentences' },
            { value: 'medium', label: 'Medium', desc: '1-2 paragraphs' },
            { value: 'long', label: 'Long', desc: '3-4 paragraphs' }
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => handleLengthChange(value)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${options.length === value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-900/50 dark:text-white'
                  : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="font-medium">{label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary Style</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleStyleChange('paragraph')}
            disabled={disabled}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3
              ${options.style === 'paragraph'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-900/50 dark:text-white'
                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <AlignLeft className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Paragraphs</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Structured text</div>
            </div>
          </button>

          <button
            onClick={() => handleStyleChange('bullet')}
            disabled={disabled}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3
              ${options.style === 'bullet'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-900/50 dark:text-white'
                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <List className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Bullet Points</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Key highlights</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
