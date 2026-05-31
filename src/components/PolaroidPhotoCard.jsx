import MaskingTape from './MaskingTape'

const PHOTO_AREA = 200

export default function PolaroidPhotoCard({
  photo,
  rotation = -2.5,
  withTape = true,
  tapeColor = 'pink',
  width = 224,
  onClick,
  children,
  className = '',
  style = {}
}) {
  const { src, caption = '', scale = 1, offsetX = 0, offsetY = 0 } = photo || {}
  const interactive = !!onClick
  return (
    <div
      className={`relative ${className}`}
      style={{ width, ...style }}
    >
      <div
        className={`relative shadow-paper rounded-md p-3 pb-12 ${
          interactive ? 'cursor-pointer' : ''
        }`}
        style={{
          backgroundColor: '#FFFCF5',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.3s ease',
          boxShadow:
            '0 2px 5px rgba(92,62,40,0.10), 0 14px 32px rgba(92,62,40,0.14), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
      >
        {withTape && (
          <MaskingTape
            color={tapeColor}
            rotation={-6}
            width={72}
            height={16}
            className="absolute -top-2 left-1/2 z-10"
            style={{ transform: 'translateX(-50%) rotate(-6deg)' }}
          />
        )}
        <div
          className="relative w-full overflow-hidden bg-cream-100 rounded-sm"
          style={{ height: PHOTO_AREA }}
        >
          {children ? (
            children
          ) : src ? (
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute top-1/2 left-1/2 select-none pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                transformOrigin: 'center'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-300 text-xs">
              기억의 한 장면
            </div>
          )}
        </div>
        {caption ? (
          <div className="absolute bottom-3 left-0 right-0 px-2 text-center text-sm text-ink-700 font-medium tracking-wide">
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  )
}
