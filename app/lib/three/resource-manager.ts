import * as THREE from 'three';

export class GeometryRegistry {
  private static instance: GeometryRegistry;
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<string, THREE.Material>();
  private stats = {
    geometryCreated: 0,
    geometryReused: 0,
    materialCreated: 0,
    materialReused: 0,
  };

  static getInstance(): GeometryRegistry {
    if (!GeometryRegistry.instance) {
      GeometryRegistry.instance = new GeometryRegistry();
    }
    return GeometryRegistry.instance;
  }

  getSphere(key: string, radius: number, segments: number): THREE.SphereGeometry {
    if (!this.geometries.has(key)) {
      this.stats.geometryCreated++;
      this.geometries.set(key, new THREE.SphereGeometry(radius, segments, segments));
    } else {
      this.stats.geometryReused++;
    }
    return this.geometries.get(key) as THREE.SphereGeometry;
  }

  getBox(key: string, w: number, h: number, d: number): THREE.BoxGeometry {
    if (!this.geometries.has(key)) {
      this.stats.geometryCreated++;
      this.geometries.set(key, new THREE.BoxGeometry(w, h, d));
    } else {
      this.stats.geometryReused++;
    }
    return this.geometries.get(key) as THREE.BoxGeometry;
  }

  getPlane(key: string, w: number, h: number): THREE.PlaneGeometry {
    if (!this.geometries.has(key)) {
      this.stats.geometryCreated++;
      this.geometries.set(key, new THREE.PlaneGeometry(w, h));
    } else {
      this.stats.geometryReused++;
    }
    return this.geometries.get(key) as THREE.PlaneGeometry;
  }

  getMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    if (!this.materials.has(key)) {
      this.stats.materialCreated++;
      this.materials.set(key, factory());
    } else {
      this.stats.materialReused++;
    }
    return this.materials.get(key)!;
  }

  getStats() {
    return {
      ...this.stats,
      geometryCount: this.geometries.size,
      materialCount: this.materials.size,
      reuseRate: this.stats.geometryReused / (this.stats.geometryCreated + this.stats.geometryReused) || 0,
    };
  }

  disposeAll(): void {
    this.geometries.forEach(g => g.dispose());
    this.materials.forEach(m => m.dispose());
    this.geometries.clear();
    this.materials.clear();
  }
}

export function useGeometryRegistry() {
  return GeometryRegistry.getInstance();
}
