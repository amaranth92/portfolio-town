function emit(control: string, pressed: boolean) {
  window.dispatchEvent(new CustomEvent('touch-control', { detail: { control, pressed } }));
}

export function TouchControls() {
  return (
    <div className="touch-controls" aria-label="Touch movement controls">
      {['left', 'jump', 'right'].map((control) => (
        <button
          key={control}
          type="button"
          onPointerDown={() => emit(control, true)}
          onPointerUp={() => emit(control, false)}
          onPointerCancel={() => emit(control, false)}
          onPointerLeave={() => emit(control, false)}
        >
          {control === 'left' ? 'Left' : control === 'right' ? 'Right' : 'Jump'}
        </button>
      ))}
    </div>
  );
}
