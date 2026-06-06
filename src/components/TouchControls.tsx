function emit(control: string, pressed: boolean) {
  // PointerUp만 믿으면 손가락이 버튼 밖으로 빠졌을 때 이동 상태가 고정될 수 있습니다.
  // 각 버튼은 cancel/leave에서도 pressed=false를 보내 Scene의 move 플래그를 항상 해제합니다.
  // 모바일 버튼 입력을 PortfolioScene이 구독하는 전역 touch-control 이벤트로 변환합니다.
  window.dispatchEvent(new CustomEvent('touch-control', { detail: { control, pressed } }));
}

export function TouchControls() {
  return (
    <div className="touch-controls" aria-label="Touch movement controls">
      <div className="move-pad">
        {['left', 'right'].map((control) => (
          <button
            key={control}
            type="button"
            aria-label={`Move ${control}`}
            onPointerDown={() => emit(control, true)}
            onPointerUp={() => emit(control, false)}
            onPointerCancel={() => emit(control, false)}
            onPointerLeave={() => emit(control, false)}
          >
            {control === 'left' ? 'Left' : 'Right'}
          </button>
        ))}
      </div>
      <button
        className="jump-button"
        type="button"
        aria-label="Jump"
        onPointerDown={() => emit('jump', true)}
        onPointerUp={() => emit('jump', false)}
        onPointerCancel={() => emit('jump', false)}
        onPointerLeave={() => emit('jump', false)}
      >
        Jump
      </button>
    </div>
  );
}
