---
id: lessons-learned
type: reference
---

# Lessons Learned (Institutional Memory)

Universal patterns extracted from mission context. Project-agnostic rules.

---

## Performance

- **[Hot Path]** Bounds Validation: Always validate array indices before access in render loops. (Context: A single out-of-bounds read in `useFrame` can crash 60fps rendering. Fail-fast is acceptable; silent undefined access is not.)

- **[React Three Fiber]** Object Pooling: Pre-allocate geometry refs and reuse via allocate/release pattern instead of creating new objects per frame. (Context: GC pressure in animation loops causes frame drops. Pool size = 2x peak expected usage.)

- **[React Three Fiber]** useFrame over RAF: Prefer R3F's `useFrame` hook over raw `requestAnimationFrame` for Three.js state updates. (Context: useFrame auto-syncs with render loop and avoids stale closures over React state.)

- **[React Three Fiber]** Persistent Mesh Architecture: Reuse `InstancedMesh` and update via `setMatrixAt()` instead of creating/destroying mesh instances. (Context: Mesh creation is expensive. Matrix updates are cheap. Hide unused instances via identity matrix at y=-1000.)
