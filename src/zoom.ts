export interface ImageZoomOptions {
  minScale?: number;
  maxScale?: number;
  wheelEnabled?: boolean;
  dragEnabled?: boolean;
  pinchEnabled?: boolean;
  buttons?: boolean;
  onZoomChange?: (scale: number) => void;
}

export class ImageZoom {
  private scale = 1;
  private translateX = 0;
  private translateY = 0;
  private rotation = 0;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private lastTranslateX = 0;
  private lastTranslateY = 0;
  private hasMoved = false;
  private initialDistance = 0;
  private initialScale = 1;

  private options: Required<ImageZoomOptions>;
  private toolbar: HTMLElement | null = null;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundWheel: (e: WheelEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  private pointerDownPos = { x: 0, y: 0 };
  private readonly CLICK_MOVE_THRESHOLD = 5;

  constructor(
    private img: HTMLImageElement,
    private container: HTMLElement | null = null,
    options: ImageZoomOptions = {},
  ) {
    this.options = {
      minScale: 0.1,
      maxScale: 5,
      wheelEnabled: true,
      dragEnabled: true,
      pinchEnabled: true,
      buttons: true,
      onZoomChange: () => {},
      ...options,
    };

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);

    this.init();
  }

  private init() {
    this.img.draggable = false;
    this.img.classList.add(this.options.dragEnabled ? 'image-zoom-cursor-grab' : 'cursor-default');
    this.img.style.userSelect = 'none';

    const eventContainer = this.container || document;
    if (this.options.wheelEnabled) {
      eventContainer.addEventListener('wheel', this.boundWheel as EventListener, { passive: false });
    }

    if (this.options.dragEnabled) {
      this.img.addEventListener('pointerdown', this.boundPointerDown);
      document.addEventListener('pointermove', this.boundPointerMove);
      document.addEventListener('pointerup', this.boundPointerUp);
    }

    if (this.options.pinchEnabled) {
      this.img.addEventListener('touchstart', this.boundTouchStart, { passive: false });
      this.img.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      this.img.addEventListener('touchend', this.boundTouchEnd);
    }

    if (this.options.buttons) {
      this.createToolbar();
    }
  }

  private createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'image-zoom-toolbar';
    toolbar.innerHTML = `
      <button class="image-zoom-btn image-zoom-btn-zoom-out" title="缩小">−</button>
      <button class="image-zoom-btn image-zoom-btn-rotate" title="旋转">↻</button>
      <button class="image-zoom-btn image-zoom-btn-zoom-in" title="放大">+</button>
    `;

    toolbar.querySelector('.image-zoom-btn-zoom-out')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomOut();
    });

    toolbar.querySelector('.image-zoom-btn-rotate')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.rotate();
    });

    toolbar.querySelector('.image-zoom-btn-zoom-in')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomIn();
    });

    if (this.container) {
      this.container.appendChild(toolbar);
    }
    else {
      this.img.parentElement?.appendChild(toolbar);
    }

    this.toolbar = toolbar;
  }

  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.hasMoved = false;
    this.startX = e.clientX - this.translateX;
    this.startY = e.clientY - this.translateY;
    this.lastTranslateX = this.translateX;
    this.lastTranslateY = this.translateY;

    this.pointerDownPos = { x: e.clientX, y: e.clientY };

    this.img.classList.replace('image-zoom-cursor-grab', 'image-zoom-cursor-grabbing');
    this.img.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;

    const newX = e.clientX - this.startX;
    const newY = e.clientY - this.startY;

    if (Math.abs(newX - this.lastTranslateX) > 5 || Math.abs(newY - this.lastTranslateY) > 5) {
      this.hasMoved = true;
    }

    this.translateX = newX;
    this.translateY = newY;
    this.applyTransform();
  }

  private onPointerUp(e: PointerEvent) {
    if (this.isDragging) {
      this.img.classList.replace('image-zoom-cursor-grabbing', 'image-zoom-cursor-grab');
      this.img.releasePointerCapture(e.pointerId);
      this.isDragging = false;

      const moveDistance = Math.sqrt(
        (e.clientX - this.pointerDownPos.x) ** 2
        + (e.clientY - this.pointerDownPos.y) ** 2,
      );

      if (moveDistance >= this.CLICK_MOVE_THRESHOLD) {
        this.hasMoved = true;
        setTimeout(() => {
          this.hasMoved = false;
        }, 0);
      }
    }
  }

  shouldPreventClose(): boolean {
    return this.hasMoved || this.scale !== 1;
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    e.stopPropagation();

    const rect = this.img.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(
      this.options.minScale,
      Math.min(this.options.maxScale, this.scale + delta),
    );

    if (newScale !== this.scale) {
      const scaleChange = newScale / this.scale;
      this.translateX = mouseX - (mouseX - this.translateX) * scaleChange;
      this.translateY = mouseY - (mouseY - this.translateY) * scaleChange;
      this.scale = newScale;
      this.applyTransform();
      this.options.onZoomChange(this.scale);
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      this.initialScale = this.scale;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const scaleRatio = currentDistance / this.initialDistance;

      const newScale = Math.max(
        this.options.minScale,
        Math.min(this.options.maxScale, this.initialScale * scaleRatio),
      );

      const rect = this.img.getBoundingClientRect();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
      const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

      if (newScale !== this.scale) {
        const scaleChange = newScale / this.scale;
        this.translateX = centerX - (centerX - this.translateX) * scaleChange;
        this.translateY = centerY - (centerY - this.translateY) * scaleChange;
        this.scale = newScale;
        this.applyTransform();
        this.options.onZoomChange(this.scale);
      }
    }
  }

  private onTouchEnd(_e: TouchEvent) {
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private applyTransform() {
    this.img.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotation}deg)`;
  }

  zoomIn(delta = 0.2): void {
    const newScale = Math.min(this.options.maxScale, this.scale + delta);
    if (newScale !== this.scale) {
      this.scale = newScale;
      this.applyTransform();
      this.options.onZoomChange(this.scale);
    }
  }

  zoomOut(delta = 0.2): void {
    const newScale = Math.max(this.options.minScale, this.scale - delta);
    if (newScale !== this.scale) {
      this.scale = newScale;
      this.applyTransform();
      this.options.onZoomChange(this.scale);
    }
  }

  rotate(): void {
    this.rotation = (this.rotation + 90) % 360;
    this.applyTransform();
  }

  reset(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.rotation = 0;
    this.applyTransform();
    this.options.onZoomChange(this.scale);
  }

  destroy(): void {
    const eventContainer = this.container || document;
    if (this.options.wheelEnabled) {
      eventContainer.removeEventListener('wheel', this.boundWheel as EventListener);
    }

    if (this.options.dragEnabled) {
      this.img.removeEventListener('pointerdown', this.boundPointerDown);
      document.removeEventListener('pointermove', this.boundPointerMove);
      document.removeEventListener('pointerup', this.boundPointerUp);
    }

    if (this.options.pinchEnabled) {
      this.img.removeEventListener('touchstart', this.boundTouchStart);
      this.img.removeEventListener('touchmove', this.boundTouchMove);
      this.img.removeEventListener('touchend', this.boundTouchEnd);
    }

    if (this.toolbar && this.toolbar.parentElement) {
      this.toolbar.parentElement.removeChild(this.toolbar);
    }

    this.img.classList.remove('image-zoom-cursor-grab', 'image-zoom-cursor-grabbing');
    this.img.style.userSelect = '';
    this.img.style.transform = '';

    this.rotation = 0;
  }

  getScale(): number {
    return this.scale;
  }

  setScale(scale: number): void {
    this.scale = Math.max(this.options.minScale, Math.min(this.options.maxScale, scale));
    this.applyTransform();
    this.options.onZoomChange(this.scale);
  }

  getRotation(): number {
    return this.rotation;
  }

  setRotation(rotation: number): void {
    this.rotation = rotation % 360;
    this.applyTransform();
  }
}
