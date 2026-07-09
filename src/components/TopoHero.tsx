import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import frag from '../shaders/topo.frag'
import vert from '../shaders/_lib/fullscreen.vert'

// Inner scene component — lives inside Canvas context
function TopoScene() {
  const { size } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uLineColor:  { value: new THREE.Color('#F7F2E8') },
      uMajorColor: { value: new THREE.Color('#FF1E2D') },
      uBgLow:      { value: new THREE.Color('#000000') },
      uBgHigh:     { value: new THREE.Color('#000000') },
      uSpeed:      { value: 0.4 },
      uScale:      { value: 2.2 },
      uLines:      { value: 26 },
      uMajorEvery: { value: 5 },
    }),
    []
  )

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uResolution.value.set(size.width, size.height)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
      />
    </mesh>
  )
}

// Pause controller — lives inside Canvas context so it can call useThree
function PauseController({ active }: { active: boolean }) {
  const { setFrameloop } = useThree()
  useEffect(() => {
    setFrameloop(active ? 'always' : 'never')
  }, [active, setFrameloop])
  return null
}

export default function TopoHero() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // frameloop is 'never' when reduced-motion OR when we pause it externally
  const [renderActive, setRenderActive] = useState(!prefersReduced)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced) return // already frozen; no observers needed

    let isVisible = true
    let isOnscreen = true

    function update() {
      setRenderActive(isVisible && isOnscreen)
    }

    function handleVisibility() {
      isVisible = document.visibilityState === 'visible'
      update()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isOnscreen = entry.isIntersecting
        update()
      },
      { threshold: 0 }
    )

    document.addEventListener('visibilitychange', handleVisibility)
    if (wrapperRef.current) observer.observe(wrapperRef.current)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      observer.disconnect()
    }
  }, [prefersReduced])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Canvas
        aria-hidden="true"
        // Start frameloop according to reduced-motion; PauseController refines
        // it inside the Canvas context once mounted.
        frameloop={renderActive ? 'always' : 'never'}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <PauseController active={renderActive} />
        <TopoScene />
      </Canvas>
    </div>
  )
}
