import * as THREE from 'three';

export class TorusPool {
  private pool: Array<{
    geometry: THREE.TorusGeometry;
    arc: number;
    inUse: boolean;
  }> = [];
  private stats = {
    acquired: 0,
    reused: 0,
    created: 0,
  };

  acquire(arc: number): THREE.TorusGeometry {
    const quantizedArc = Math.round(arc * 100) / 100;

    const cached = this.pool.find(
      item => !item.inUse && Math.abs(item.arc - quantizedArc) < 0.01
    );

    this.stats.acquired++;
    if (cached) {
      cached.inUse = true;
      this.stats.reused++;
      return cached.geometry;
    }

    this.stats.created++;
    const geometry = new THREE.TorusGeometry(2.0, 0.1, 16, 64, quantizedArc);
    this.pool.push({ geometry, arc: quantizedArc, inUse: true });
    return geometry;
  }

  release(geometry: THREE.TorusGeometry): void {
    const item = this.pool.find(i => i.geometry === geometry);
    if (item) item.inUse = false;
  }

  getStats() {
    return {
      ...this.stats,
      poolSize: this.pool.length,
      activeCount: this.pool.filter(i => i.inUse).length,
      reuseRate: this.stats.reused / this.stats.acquired || 0,
    };
  }

  dispose(): void {
    this.pool.forEach(item => item.geometry.dispose());
    this.pool = [];
  }
}

let torusPoolInstance: TorusPool | null = null;

export function useTorusPool(): TorusPool {
  if (!torusPoolInstance) {
    torusPoolInstance = new TorusPool();
  }
  return torusPoolInstance;
}
