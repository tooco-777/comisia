import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';

export default function ImageCropModal({ imageSrc, aspect = 1, title = '画像のトリミング', onCropComplete, onClose }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgObj, setImgObj] = useState(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setImgObj(img);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!imgObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Canvas サイズ設定 (解像度を高めに保つ)
    const targetWidth = aspect > 1.5 ? 800 : 400;
    const targetHeight = Math.round(targetWidth / aspect);
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画像描画計算
    const scale = Math.max(canvas.width / imgObj.width, canvas.height / imgObj.height) * zoom;
    const drawWidth = imgObj.width * scale;
    const drawHeight = imgObj.height * scale;

    const x = (canvas.width - drawWidth) / 2 + offset.x;
    const y = (canvas.height - drawHeight) / 2 + offset.y;

    ctx.drawImage(imgObj, x, y, drawWidth, drawHeight);
  }, [imgObj, zoom, offset, aspect]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const croppedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="clean-card" style={{ maxWidth: aspect > 1.5 ? '680px' : '480px', width: '100%', padding: '1.75rem', margin: '1rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>{title}</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          ドラッグして位置を調整し、スライダーで拡大・縮小できます。
        </p>

        {/* プレビューCanvas */}
        <div 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            maxHeight: '360px',
            background: '#0f172a',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #38bdf8'
          }}
        >
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* 拡大スライダー ＆ コントロール */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ZoomOut size={16} color="var(--text-muted)" />
          <input 
            type="range" min="1" max="3" step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <ZoomIn size={16} color="var(--text-muted)" />
          <button 
            type="button" 
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RotateCcw size={14} /> リセット
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>キャンセル</button>
          <button type="button" className="btn btn-primary" onClick={handleApply}>
            <Check size={16} /> トリミング位置を決定
          </button>
        </div>
      </div>
    </div>
  );
}
