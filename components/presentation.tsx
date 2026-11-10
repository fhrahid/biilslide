"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bolt,
  Box, Camera, Check, CircleHelp, Cpu,
  Gauge, HardDrive, Layers3, Maximize, Minimize, Network, ScanLine, Shield,
  Thermometer, Wind, X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Group, InstancedMesh, Mesh } from "three";
import * as THREE from "three";

const team = [
  { name: "Jihadul Islam Jitu", image: "/team/jihadul-islam-jitu.jpeg" },
  { name: "Sifat Ibne Mazib", image: "/team/sifat-ibne-mazib.jpg" },
  { name: "Pramit Datta", image: "/team/pramit-datta.jpg" },
  { name: "MD Ferdous Hasan Rahid", image: "/team/md-ferdous-hasan-rahid.jpeg" },
  { name: "Khandokar Mosleh Uddin", image: "/team/khandokar-mosleh-uddin.jpeg" },
];

const chapters = [
  "Opening", "The challenge", "The BIIL vision", "Six intelligence domains",
  "Machine intelligence", "Computer vision quality", "Safety & environment",
  "System architecture", "Command center", "Hardware & technology",
  "Roadmap & investment", "The intended outcome",
];

const problems = [
  ["Unexpected machine breakdowns", "A stoppage can interrupt an entire production flow.", "01"],
  ["Lack of real-time machine & production monitoring", "Machine and production status are hard to see together.", "02"],
  ["Undetected product defects", "Quality issues may be discovered after production moves on.", "03"],
  ["Excessive energy consumption & wastage", "High consumption can remain hidden across equipment and lines.", "04"],
  ["Limited product traceability", "Product identity is difficult to follow through each stage.", "05"],
  ["Workplace safety risks & delayed alerts", "Workplace events need timely visibility and response.", "06"],
  ["Fragmented factory information systems", "Operational data sits across records and separate systems.", "07"],
];

const domains = [
  { title: "Machine Intelligence", sub: "Condition · anomaly · maintenance", input: "Temperature · vibration · current · power · RPM", process: "Validate telemetry; identify anomalies; support failure prediction.", output: "Machine status and maintenance alerts", color: "#74d9c8", icon: Activity },
  { title: "Production Intelligence", sub: "Count · progress · trace", input: "Production activity · barcode / RFID identity", process: "Count items and relate identifiers to production stages.", output: "Line progress and product traceability", color: "#7bb9ff", icon: BarChart3 },
  { title: "Quality Intelligence", sub: "Vision · inspect · classify", input: "Industrial camera images of fabric or products", process: "OpenCV rules paired with a lightweight learned detector.", output: "Defect type, location, confidence and reporting", color: "#c4a3ff", icon: ScanLine },
  { title: "Energy Intelligence", sub: "Measure · understand", input: "Single / three-phase energy meter readings", process: "Collect and analyze electricity consumption.", output: "Energy usage monitoring and analysis", color: "#ffd07a", icon: Bolt },
  { title: "Environmental & Safety", sub: "Sense · monitor · alert", input: "Temperature · humidity · air quality · gas · camera", process: "Environmental monitoring and PPE / safety-event checks.", output: "Safety and environmental alerts", color: "#ff9d83", icon: Shield },
  { title: "Factory Analytics", sub: "Unify · report · inform", input: "Validated operational data across BIIL modules", process: "Present information through dashboards and reporting.", output: "Dashboards · reports · notifications · recommendations", color: "#88d8ff", icon: Network },
];

const teamLead = "BIIL: An AIoT and Computer Vision Enabled Industrial Intelligence Platform for Smart RMG Manufacturing in Bangladesh.";

type WorldState = { stage: number; reveal: number };

function FactoryMachines() {
  const body = useRef<InstancedMesh>(null);
  const table = useRef<InstancedMesh>(null);
  const plate = useRef<InstancedMesh>(null);
  const roller = useRef<InstancedMesh>(null);
  const indicator = useRef<InstancedMesh>(null);
  const positions = useMemo(() => Array.from({ length: 24 }, (_, i): [number, number, number] => [i * 3.2 - 2, 0, i % 2 === 0 ? 2.4 : -4.1]), []);
  const parts = useMemo(() => ({
    body: new THREE.BoxGeometry(1.15, 0.8, 0.72),
    table: new THREE.BoxGeometry(1.45, 0.18, 0.92),
    plate: new THREE.BoxGeometry(0.72, 0.18, 0.62),
    roller: new THREE.CylinderGeometry(0.16, 0.16, 0.15, 20),
    indicator: new THREE.SphereGeometry(0.055, 10, 10),
    bodyMat: new THREE.MeshStandardMaterial({ color: "#223640", metalness: 0.72, roughness: 0.35 }),
    tableMat: new THREE.MeshStandardMaterial({ color: "#112129", metalness: 0.65 }),
    plateMat: new THREE.MeshStandardMaterial({ color: "#a5b5b9", metalness: 0.82, roughness: 0.28 }),
    rollerMat: new THREE.MeshStandardMaterial({ color: "#d19443", metalness: 0.7 }),
    indicatorMat: new THREE.MeshBasicMaterial({ color: "#5ef0d2" }),
  }), []);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    positions.forEach(([x, , z], i) => {
      const transforms: [InstancedMesh | null, number, [number, number, number], [number, number, number]][] = [
        [body.current, 0.55, [x, 0, z], [1, 1, 1]],
        [table.current, 0.1, [x, 0, z], [1, 1, 1]],
        [plate.current, 1.05, [x + 0.05, -0.08, z - 0.08], [1, 1, 1]],
        [roller.current, 0.93, [x + 0.35, 0, z + 0.16], [1, 1, 1]],
        [indicator.current, 0.64, [x + 0.49, 0, z + 0.38], [1, 1, 1]],
      ];
      transforms.forEach(([mesh, y, [tx, ty, tz], scale]) => {
        if (!mesh) return;
        dummy.position.set(tx, y + ty, tz);
        dummy.scale.set(...scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
    });
    [body, table, plate, roller, indicator].forEach((ref) => { if (ref.current) ref.current.instanceMatrix.needsUpdate = true; });
  }, [positions]);
  return <>
    <instancedMesh ref={body} args={[parts.body, parts.bodyMat, positions.length]} />
    <instancedMesh ref={table} args={[parts.table, parts.tableMat, positions.length]} />
    <instancedMesh ref={plate} args={[parts.plate, parts.plateMat, positions.length]} />
    <instancedMesh ref={roller} args={[parts.roller, parts.rollerMat, positions.length]} />
    <instancedMesh ref={indicator} args={[parts.indicator, parts.indicatorMat, positions.length]} />
  </>;
}

function Signal({ start, end, color = "#38d9d0", delay = 0 }: { start: [number, number, number]; end: [number, number, number]; color?: string; delay?: number }) {
  const point = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!point.current) return;
    const t = (clock.elapsedTime * 0.34 + delay) % 1;
    point.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], t),
      THREE.MathUtils.lerp(start[1], end[1], t) + Math.sin(t * Math.PI) * 0.4,
      THREE.MathUtils.lerp(start[2], end[2], t),
    );
  });
  return <>
    <Line points={[start, [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.38, (start[2] + end[2]) / 2], end]} color={color} lineWidth={1} transparent opacity={0.27} />
    <mesh ref={point}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color={color} /></mesh>
  </>;
}

function Landmark({ index, color = "#55ddd2" }: { index: number; color?: string }) {
  const group = useRef<Group>(null);
  const x = index * 4.8;
  useFrame(({ clock }) => { if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.28 + index) * 0.04; });
  if (index === 11) return <group ref={group} position={[x, 0, -1]}>
    <mesh position={[0, 1.95, 0]}><torusGeometry args={[1.05, 0.016, 8, 80]} /><meshBasicMaterial color={color} transparent opacity={0.65} /></mesh>
    <mesh position={[0, 2, 0]}><icosahedronGeometry args={[0.48, 1]} /><meshStandardMaterial color="#1c5058" emissive={color} emissiveIntensity={0.55} metalness={0.72} roughness={0.25} wireframe /></mesh>
    <mesh position={[0, 1.28, 0]}><cylinderGeometry args={[0.45, 0.72, 0.12, 32]} /><meshStandardMaterial color="#162832" emissive="#124c50" emissiveIntensity={0.3} metalness={0.7} /></mesh>
    {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.12, 1.98, Math.sin(i * Math.PI / 3) * 1.12]}><sphereGeometry args={[0.075, 12, 12]} /><meshBasicMaterial color={i === 3 ? "#f8b45e" : color} /></mesh>)}
  </group>;
  if (index === 0) return <group ref={group} position={[x, 0, -1]}>
    <mesh position={[-1.75, 1.85, 0]}><boxGeometry args={[0.12, 3.7, 0.13]} /><meshStandardMaterial color="#344b50" metalness={0.72} /></mesh>
    <mesh position={[1.75, 1.85, 0]}><boxGeometry args={[0.12, 3.7, 0.13]} /><meshStandardMaterial color="#344b50" metalness={0.72} /></mesh>
    <mesh position={[0, 3.66, 0]}><boxGeometry args={[3.62, 0.12, 0.15]} /><meshStandardMaterial color="#496066" metalness={0.7} /></mesh>
    <mesh position={[0, 0.48, 0.3]}><boxGeometry args={[3.35, 0.16, 2.3]} /><meshStandardMaterial color="#162b31" metalness={0.55} /></mesh>
    <mesh position={[0, 0.58, 0.27]}><boxGeometry args={[2.6, 0.035, 1.72]} /><meshStandardMaterial color="#84918a" roughness={0.82} /></mesh>
    {[-1, 0, 1].map((offset, i) => <group key={i} position={[offset, 0, -0.62]}>
      <mesh position={[0, 1.1, 0]}><boxGeometry args={[0.72, 0.56, 0.62]} /><meshStandardMaterial color="#324850" metalness={0.62} roughness={0.36} /></mesh>
      <mesh position={[0.05, 1.43, -0.05]}><boxGeometry args={[0.53, 0.11, 0.49]} /><meshStandardMaterial color="#a9b3ab" metalness={0.72} /></mesh>
      <mesh position={[0.18, 1.08, 0.33]}><cylinderGeometry args={[0.11, 0.11, 0.12, 16]} /><meshStandardMaterial color="#d6a35d" metalness={0.65} /></mesh>
      <mesh position={[0, 0.08, -0.05]}><boxGeometry args={[0.88, 0.13, 0.76]} /><meshStandardMaterial color="#1a2b32" metalness={0.55} /></mesh>
    </group>)}
    <mesh position={[0, 3.43, 0]}><boxGeometry args={[1.6, 0.035, 0.24]} /><meshBasicMaterial color="#72ded0" transparent opacity={0.78} /></mesh>
    <mesh position={[1.53, 2.85, 0.1]}><boxGeometry args={[0.08, 0.3, 0.08]} /><meshBasicMaterial color="#f0ad60" /></mesh>
  </group>;
  if (index === 1) return <group ref={group} position={[x, 1.35, -1]}>
    {Array.from({ length: 7 }, (_, i) => { const a = i * Math.PI * 2 / 7; return <group key={i} position={[Math.cos(a) * 1.3, Math.sin(a) * 0.85, 0]}>
      <mesh><boxGeometry args={[0.42, 0.31, 0.2]} /><meshStandardMaterial color="#48383a" emissive="#7d3e32" emissiveIntensity={0.16} /></mesh>
      <mesh position={[0, 0, 0.12]}><sphereGeometry args={[0.045, 10, 10]} /><meshBasicMaterial color="#f0ac61" /></mesh>
    </group>; })}
    <Line points={[[-1.6, 0.65, 0], [-0.45, 0.18, 0], [0.45, -0.32, 0], [1.45, -0.65, 0]]} color="#d28c61" lineWidth={1} transparent opacity={0.5} />
  </group>;
  if (index === 2) return <group ref={group} position={[x, 1.35, -1]}>
    <mesh><dodecahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color="#1b5357" emissive="#27cfc0" emissiveIntensity={0.5} wireframe /></mesh>
    {Array.from({ length: 5 }, (_, i) => { const a = i * Math.PI * 2 / 5; const start: [number, number, number] = [Math.cos(a) * 1.55, Math.sin(a) * 0.92, 0]; return <group key={i}>
      <Line points={[start, [0, 0, 0]]} color="#50c9c0" lineWidth={1} transparent opacity={0.46} />
      <mesh position={start}><octahedronGeometry args={[0.15, 0]} /><meshStandardMaterial color="#61d8c9" emissive="#227a71" emissiveIntensity={0.36} /></mesh>
    </group>; })}
    <mesh><torusGeometry args={[0.82, 0.012, 6, 40]} /><meshBasicMaterial color="#5cd7cd" transparent opacity={0.55} /></mesh>
  </group>;
  if (index === 3) return <group ref={group} position={[x, 1.5, -1]}>
    {domains.map((d, i) => { const a = i * Math.PI / 3; return <group key={d.title} position={[Math.cos(a) * 1.5, Math.sin(a) * 0.95, 0]}>
      <mesh><octahedronGeometry args={[0.3, 0]} /><meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.45} metalness={0.65} /></mesh>
      <mesh><torusGeometry args={[0.46, 0.012, 6, 24]} /><meshBasicMaterial color={d.color} transparent opacity={0.5} /></mesh>
    </group>; })}
    <mesh><dodecahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color="#18404b" emissive="#19bcb4" emissiveIntensity={0.45} wireframe /></mesh>
  </group>;
  if (index === 4) return <group ref={group} position={[x, 0.9, -1]}>
    <mesh castShadow><cylinderGeometry args={[0.58, 0.58, 1.15, 32]} /><meshStandardMaterial color="#3b5661" metalness={0.8} roughness={0.28} /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0.68, 0, 0]}><cylinderGeometry args={[0.42, 0.42, 0.32, 32]} /><meshStandardMaterial color="#1b303a" metalness={0.7} /></mesh>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0.9, 0, 0]}><torusGeometry args={[0.24, 0.045, 8, 24]} /><meshStandardMaterial color="#65ddcf" metalness={0.65} emissive="#125b58" /></mesh>
    {[0, 1, 2, 3].map(i => <mesh key={i} position={[-0.36 + i * 0.24, 0.64, 0]}><boxGeometry args={[0.045, 0.4, 0.62]} /><meshStandardMaterial color="#d89c4e" emissive="#6a4019" emissiveIntensity={0.25} /></mesh>)}
    <mesh position={[-0.55, 0.85, 0.48]}><sphereGeometry args={[0.1, 16, 16]} /><meshBasicMaterial color="#ffb451" /></mesh>
  </group>;
  if (index === 5) return <group ref={group} position={[x, 0.55, -1]}>
    <mesh rotation={[-0.08, 0, 0]}><boxGeometry args={[2.25, 0.08, 2.6]} /><meshStandardMaterial color="#324451" roughness={0.68} /></mesh>
    {Array.from({ length: 17 }, (_, i) => <mesh key={i} position={[-1.03 + (i % 9) * 0.26, 0.61 + Math.floor(i / 9) * 0.42, 0.07]}><boxGeometry args={[0.035, 0.035, 2.1]} /><meshBasicMaterial color={i % 3 === 0 ? "#91c8b5" : "#668879"} /></mesh>)}
    <mesh position={[0, 1.8, -0.1]}><boxGeometry args={[0.42, 0.36, 0.48]} /><meshStandardMaterial color="#172a34" metalness={0.65} /></mesh>
    <mesh position={[0, 1.57, 0.02]}><coneGeometry args={[0.72, 1.4, 4]} /><meshBasicMaterial color="#59dcd3" transparent opacity={0.08} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.45, 0.72, 0.35]}><boxGeometry args={[0.4, 0.24, 0.02]} /><meshBasicMaterial color="#ffb760" wireframe /></mesh>
  </group>;
  if (index === 7) return <group ref={group} position={[x, 1.2, -1]}>
    {[0, 1, 2, 3].map((layer) => <group key={layer} position={[0, layer * 0.65 - 0.85, 0]}>
      <mesh><boxGeometry args={[2.6, 0.18, 1.35]} /><meshStandardMaterial color={["#214b42", "#343260", "#20505c", "#293a4b"][layer]} transparent opacity={0.78} metalness={0.5} /></mesh>
      {[-0.78, 0, 0.78].map((offset, j) => <mesh key={j} position={[offset, 0.13, 0]}><boxGeometry args={[0.58, 0.1, 0.72]} /><meshStandardMaterial color={layer === 3 ? "#72a9d0" : layer === 2 ? "#58c6c0" : layer === 1 ? "#ae92eb" : "#75c4a0"} emissive="#133038" emissiveIntensity={0.3} /></mesh>)}
    </group>)}
    <Signal start={[-1.5, -0.92, 0]} end={[1.5, 0.93, 0]} delay={0.1} />
  </group>;
  if (index === 8) return <group ref={group} position={[x, 1.35, -1]}>
    <mesh><boxGeometry args={[3.1, 1.85, 0.12]} /><meshStandardMaterial color="#10212c" metalness={0.65} roughness={0.3} /></mesh>
    <mesh position={[0, 0, 0.075]}><planeGeometry args={[2.85, 1.57]} /><meshBasicMaterial color="#09131b" /></mesh>
    {[0, 1, 2, 3].map((i) => <mesh key={i} position={[-0.83 + i * 0.55, 0.2 + Math.sin(i * 0.8) * 0.18, 0.15]}><boxGeometry args={[0.12, 0.42 + i * 0.11, 0.025]} /><meshBasicMaterial color={i === 2 ? "#e3a95d" : "#4ec9c4"} /></mesh>)}
    <mesh position={[0, -0.43, 0.15]}><planeGeometry args={[2.35, 0.02]} /><meshBasicMaterial color="#456a73" /></mesh>
  </group>;
  if (index === 9) return <group ref={group} position={[x, 1, -1]}>
    {[-1.15, -0.38, 0.38, 1.15].map((xPos, i) => <group key={i} position={[xPos, (i % 2) * 0.46 - 0.15, (i % 2) * 0.15]}>
      <mesh position={[0, 0.36, 0]}><boxGeometry args={[0.65, 0.72, 0.56]} /><meshStandardMaterial color={i === 2 ? "#203d50" : "#283943"} metalness={0.76} roughness={0.32} /></mesh>
      <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.72, 0.08, 0.62]} /><meshStandardMaterial color="#57d8cb" emissive="#164c4b" /></mesh>
      <mesh position={[0.17, 0.45, 0.29]}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color={i === 2 ? "#ffad59" : "#65e3c8"} /></mesh>
    </group>)}
  </group>;
  if (index === 10) return <group ref={group} position={[x, 1.05, -1]}>
    <Line points={[[-1.85, 0, 0], [1.85, 0, 0]]} color="#45c7c2" lineWidth={2} />
    {Array.from({ length: 5 }, (_, i) => <group key={i} position={[-1.55 + i * 0.78, 0, 0]}>
      <mesh><cylinderGeometry args={[0.12, 0.12, 0.12, 20]} /><meshStandardMaterial color={i === 0 ? "#7bd1a6" : "#e9ad62"} emissive={i === 0 ? "#184c3b" : "#5e381b"} /></mesh>
      <mesh position={[0, -0.38, 0]}><boxGeometry args={[0.42, 0.22, 0.24]} /><meshStandardMaterial color="#172a34" /></mesh>
    </group>)}
  </group>;
  return <group ref={group} position={[x, 1.3, -1]}>
    {[0, 1, 2, 3, 4].map((i) => <group key={i} position={[-1.35 + i * 0.68, 0, 0]}>
      <mesh position={[0, 0.25, 0]}><boxGeometry args={[0.28, 0.5, 0.22]} /><meshStandardMaterial color="#789099" metalness={0.32} roughness={0.8} /></mesh>
      <mesh position={[0, 0.62, 0]}><sphereGeometry args={[0.14, 14, 14]} /><meshStandardMaterial color="#b3a28e" roughness={0.8} /></mesh>
    </group>)}
  </group>;
}

function IndustrialWorld({ world }: { world: React.MutableRefObject<WorldState> }) {
  const factory = useRef<Group>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const tealLight = useRef<THREE.PointLight>(null);
  const blueLight = useRef<THREE.PointLight>(null);
  const frontLight = useRef<THREE.PointLight>(null);
  useFrame(({ camera, clock }) => {
    const stage = world.current.stage;
    const reveal = world.current.reveal;
    if (ambient.current) ambient.current.intensity = 1.05 * reveal;
    if (keyLight.current) keyLight.current.intensity = 2.8 * reveal;
    if (tealLight.current) tealLight.current.intensity = 35 * reveal;
    if (blueLight.current) blueLight.current.intensity = 28 * reveal;
    if (frontLight.current) frontLight.current.intensity = 24 * reveal;
    const targetX = stage * 4.8;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.2, 1 / 60);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, stage === 0 || stage === 11 ? 3.1 : 2.6, 2, 1 / 60);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, stage === 0 || stage === 11 ? 9.4 : 8.2, 2, 1 / 60);
    camera.lookAt(targetX, 1.35, -1.2);
    if (factory.current) factory.current.position.y = Math.sin(clock.elapsedTime * 0.34) * 0.018;
  });
  return <>
    <color attach="background" args={["#070c12"]} />
    <fog attach="fog" args={["#070c12", 10, 33]} />
    <ambientLight ref={ambient} intensity={0} />
    <directionalLight ref={keyLight} position={[3, 8, 5]} intensity={0} color="#c8e9ea" />
    <pointLight ref={tealLight} position={[0, 3, -4]} intensity={0} color="#147e88" distance={13} />
    <pointLight ref={blueLight} position={[15, 2, -3]} intensity={0} color="#174b7e" distance={12} />
    <pointLight ref={frontLight} position={[0, 5, 5]} intensity={0} color="#398f8c" distance={17} />
    <group ref={factory}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, -0.13, -2]} receiveShadow><planeGeometry args={[90, 15]} /><meshStandardMaterial color="#101a21" metalness={0.45} roughness={0.72} /></mesh>
      <gridHelper args={[80, 80, "#263b3f", "#17252c"]} position={[24, -0.115, -2]} />
      <FactoryMachines />
      {Array.from({ length: 12 }, (_, i) => <group key={`lamp-${i}`} position={[i * 7.2 - 3, 5.5, -1]}>
        <mesh><boxGeometry args={[3.4, 0.08, 0.28]} /><meshBasicMaterial color="#5aaeb2" transparent opacity={0.5} /></mesh>
        {i % 4 === 0 && <pointLight position={[0, -0.7, 0]} intensity={6} distance={6} color="#54b6b1" />}
      </group>)}
      {Array.from({ length: 12 }, (_, i) => <mesh key={`pillar-${i}`} position={[i * 7.2 - 3, 2.6, -6.5]}><boxGeometry args={[0.16, 5.2, 0.2]} /><meshStandardMaterial color="#26363b" metalness={0.72} /></mesh>)}
    </group>
    {Array.from({ length: 12 }, (_, i) => <Landmark key={`landmark-${i}`} index={i} />)}
    {Array.from({ length: 11 }, (_, i) => <Signal key={`signal-${i}`} start={[i * 4.8 + 1.1, 1.7, -1.3]} end={[(i + 1) * 4.8 - 1.2, 1.3, -1.3]} delay={i * 0.13} />)}
    <Float speed={0.6} rotationIntensity={0.04} floatIntensity={0.08}><mesh position={[0, 0.05, 5.4]}><boxGeometry args={[50, 0.03, 0.04]} /><meshBasicMaterial color="#38a9a3" transparent opacity={0.65} /></mesh></Float>
  </>;
}

function TeamStrip() {
  return <section className="team-roster" aria-label="Project team members">
    <div className="team-roster-heading"><strong>PROJECT TEAM</strong><span>5 MEMBERS</span></div>
    <div className="team-roster-grid">{team.map((person, index) => <div className="team-member" key={person.name}>
      <div className="member-portrait"><Image src={person.image} alt={person.name} fill sizes="48px" /></div>
      <div className="member-details"><small>0{index + 1}</small><strong>{person.name}</strong></div>
    </div>)}</div>
  </section>;
}

function SupervisorPortrait() {
  return <div className="supervisor-portrait"><Image src="/team/md-habibullah-belali.jpg" alt="Md. Habibullah Belali, project supervisor" fill sizes="56px" /></div>;
}

function SlideHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <header className="slide-heading"><p className="eyebrow"><span className="eyebrow-line" />{eyebrow}</p><h1>{title}</h1><p className="subtitle">{subtitle}</p></header>;
}

function DataViz({ slide, selectedDomain, setSelectedDomain, anomaly, setAnomaly, standard, setStandard }: {
  slide: number; selectedDomain: number; setSelectedDomain: (i: number) => void;
  anomaly: boolean; setAnomaly: (v: boolean) => void; standard: boolean; setStandard: (v: boolean) => void;
}) {
  if (slide === 0) return <div className="hero-stats"><div><span>01</span><strong>UNIFIED</strong><small>industrial intelligence layer</small></div><div><span>02</span><strong>MODULAR</strong><small>pilot line to wider scale</small></div><div><span>03</span><strong>PROPOSED</strong><small>FYDP-I system design</small></div></div>;
  if (slide === 1) return <div className="problem-board"><div className="problem-board-top"><span>OPERATIONAL SIGNALS</span><span className="status muted"><i /> DISCONNECTED VIEW</span></div><div className="problem-lines">{problems.map((p, i) => <div className="problem-row" key={p[0]}><span className="problem-index">{p[2]}</span><strong className="problem-label">{p[0]}</strong><div className="problem-graph"><i style={{ width: `${29 + (i * 19) % 68}%`, animationDelay: `${i * 0.12}s` }} /></div><span className="problem-warning"><AlertTriangle size={14} /></span></div>)}</div><p className="viz-note">Seven documented operational challenges · problem statement, §1.1</p></div>;
  if (slide === 2) return <div className="convergence"><div className="source-column">{["MACHINE TELEMETRY", "CAMERA IMAGES", "ENVIRONMENT", "PRODUCT ID", "ENERGY METER"].map((s, i) => <div key={s} className="source-node" style={{ "--delay": `${i * 0.12}s` } as React.CSSProperties}><span className="source-dot" />{s}<ArrowRight size={15} /></div>)}</div><div className="converge-lines"><i /><i /><i /><i /><i /></div><div className="biil-core"><div className="core-ring"><Layers3 size={26} /></div><strong>BIIL</strong><span>UNIFIED OPERATIONAL VIEW</span></div></div>;
  if (slide === 3) return <div className="domain-explorer"><div className="domain-orbit"><div className="orbit-core">BIIL<span>INTELLIGENCE LAYER</span></div><div className="orbit-ring" />{domains.map((d, i) => { const Icon = d.icon; return <button key={d.title} className={`orbit-node ${selectedDomain === i ? "selected" : ""}`} style={{ "--angle": `${i * 60 - 90}deg`, "--domain-color": d.color } as React.CSSProperties} onClick={() => setSelectedDomain(i)} aria-label={`Explore ${d.title}`}><Icon size={19} /><span>{String(i + 1).padStart(2, "0")}</span></button>; })}</div><div className="domain-detail"><div className="domain-detail-heading"><span className="domain-number">0{selectedDomain + 1}</span><div><strong>{domains[selectedDomain].title}</strong><span>{domains[selectedDomain].sub}</span></div></div><div className="domain-detail-grid"><div><small>INPUTS</small><p>{domains[selectedDomain].input}</p></div><div><small>PROCESSING</small><p>{domains[selectedDomain].process}</p></div><div><small>OUTPUT</small><p>{domains[selectedDomain].output}</p></div></div></div></div>;
  if (slide === 4) return <div className="machine-demo"><div className="demo-topline"><span><Activity size={15} /> MACHINE CONDITION PIPELINE</span><span className="demo-tag">SIMULATED READINGS</span></div><div className="motor-scene"><div className={`motor ${anomaly ? "hot" : ""}`}><div className="motor-body"><i /><i /><i /><span className="motor-cap" /></div><div className="motor-foot" /></div><div className="sensor-tag t-temp"><Thermometer size={14} /><span>TEMP</span><b>{anomaly ? "↑" : "—"}</b></div><div className="sensor-tag t-vib"><Activity size={14} /><span>VIBRATION</span><b>{anomaly ? "↑" : "—"}</b></div><div className="sensor-tag t-rpm"><Gauge size={14} /><span>RPM / POWER</span><b>INPUT</b></div><div className="motor-alert">{anomaly ? <><AlertTriangle size={14} /> SIMULATED ANOMALY · REVIEW REQUIRED</> : <><Check size={14} /> MONITORING PIPELINE · CONCEPT</>}</div></div><div className="signal-chart"><div className="chart-label"><span>VIBRATION SIGNAL</span><span>{anomaly ? "ANOMALY EVENT · SIMULATED" : "ILLUSTRATIVE SIGNAL"}</span></div><div className={`waveform ${anomaly ? "anomaly" : ""}`}>{Array.from({ length: 54 }, (_, i) => <i key={i} style={{ height: `${12 + Math.abs(Math.sin(i * (anomaly ? 1.48 : 0.38)) * (anomaly ? 73 : 35))}%` }} />)}</div></div><button className="outline-action" onClick={() => setAnomaly(!anomaly)}>{anomaly ? "Reset simulation" : "Simulate anomaly"}<ArrowRight size={15} /></button></div>;
  if (slide === 5) return <div className="vision-demo"><div className="vision-head"><span><Camera size={15} /> INDUSTRIAL INSPECTION · CONCEPT</span><span className="demo-tag">PROPOSED PIPELINE</span></div><div className="fabric-scan"><div className="fabric-texture" /><div className="scan-beam" /><div className="fabric-defect defect-one" /><div className="fabric-defect defect-two" /><div className="detection-box"><span>DEFECT REGION</span></div><div className="scan-camera"><Camera size={18} /><span>FIXED CAMERA</span></div><div className="scan-caption">SCANNING SURFACE · SCHEMATIC</div></div><div className="pipeline-steps">{[["01", "Capture", "Industrial camera"], ["02", "Preprocess", "OpenCV · ROI"], ["03", "Rule checks", "Threshold · morphology"], ["04", "Learned detection", "Lightweight model"], ["05", "Report", "Type · location · confidence"]].map((s, i) => <div className={`pipeline-step ${i === 2 ? "active" : ""}`} key={s[0]}><small>{s[0]}</small><strong>{s[1]}</strong><span>{s[2]}</span></div>)}</div><p className="viz-note">Proposed hybrid pipeline · no BIIL model performance is claimed.</p></div>;
  if (slide === 6) return <div className="safety-demo"><div className="safety-scene"><div className="safety-camera"><Camera size={16} /><span>VISION ZONE</span></div><div className="safety-cone" /><div className="worker-symbol"><div className="worker-head" /><div className="worker-torso"><span className="ppe-mark">PPE</span></div><div className="worker-legs" /></div><div className="zone-outline" /><span className="zone-label">PPE MONITORING AREA</span><div className="env-sensor"><Wind size={16} /><span>ENVIRONMENT NODE</span></div></div><div className="safety-metrics">{[[Thermometer, "TEMPERATURE", "Sensor input"], [Wind, "HUMIDITY / AIR", "Environmental sensing"], [AlertTriangle, "GAS LEVEL", "Threshold monitoring"]].map(([Icon, title, sub]) => { const I = Icon as typeof Activity; return <div className="safety-metric" key={title as string}><I size={16} /><div><strong>{title as string}</strong><span>{sub as string}</span></div><b>—</b></div>; })}</div><p className="viz-note">Safety events and PPE checks are proposed. No worker attendance or productivity scoring.</p></div>;
  if (slide === 7) return <div className="architecture-visual"><div className="arch-flow">SENSORS <ArrowRight size={14} /> EDGE <ArrowRight size={14} /> PLATFORM <ArrowRight size={14} /> USERS & ERP/MES</div>{[
    ["04", "CLIENT LAYER", "Factory dashboard", "Reports & alerts", "Role-based access", "#7bb9ff"],
    ["03", "APPLICATION LAYER", "Device & data services", "Factory operations", "Alerts & integration", "#54d5c7"],
    ["02", "AI, DATA & INTEGRATION", "AI services", "Operational database", "ERP / MES", "#b99aff"],
    ["01", "INDUSTRIAL EDGE LAYER", "Machine & product sensors", "Environment & safety", "ESP32 + vision gateway", "#7bd1a6"],
  ].map((layer) => <div className="arch-layer" key={layer[0]} style={{ "--layer-color": layer[5] } as React.CSSProperties}><div className="arch-layer-name"><small>{layer[0]}</small><strong>{layer[1]}</strong></div><div className="arch-modules">{layer.slice(2, 5).map((m) => <span key={m}>{m}</span>)}</div></div>)}<div className="arch-protocol">MQTT / HTTPS over TLS <span>·</span> secure data flow: collect → transmit → analyze → store → notify</div></div>;
  if (slide === 8) return <div className="dashboard-demo"><div className="dashboard-top"><div><i /> <span>BIIL / FACTORY OVERVIEW</span></div><small>DEMONSTRATION DATA · NOT PROJECT RESULTS</small></div><div className="dashboard-kpis">{[["MACHINE STATUS", "Monitoring view", "#70d7bd"], ["PRODUCTION", "Progress view", "#81b8ff"], ["QUALITY", "Inspection view", "#c49aff"], ["ENERGY", "Usage view", "#f2bd69"]].map((k) => <div className="dashboard-kpi" key={k[0]}><small>{k[0]}</small><i style={{ background: k[2] }} /><strong>{k[1]}</strong><span>Illustrative UI</span></div>)}</div><div className="dash-panels"><div className="dash-chart"><div className="panel-title">PRODUCTION ACTIVITY <span>concept visualization</span></div><div className="dash-gridlines" /> <svg viewBox="0 0 450 130" preserveAspectRatio="none" aria-label="Illustrative production chart"><path d="M0 100 C40 85 52 89 84 72 S130 80 156 59 S200 68 232 52 S280 60 305 37 S352 49 382 25 S420 31 450 15" fill="none" stroke="#60d3cb" strokeWidth="2.5" /><path d="M0 100 C40 85 52 89 84 72 S130 80 156 59 S200 68 232 52 S280 60 305 37 S352 49 382 25 S420 31 450 15 L450 130 L0 130Z" fill="url(#chartFill)" opacity=".2" /><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#60d3cb" /><stop offset="1" stopColor="#60d3cb" stopOpacity="0" /></linearGradient></defs></svg><div className="chart-x"><span>SHIFT START</span><span>PRODUCTION TIMELINE</span><span>SHIFT END</span></div></div><div className="alerts-panel"><div className="panel-title">ALERTS & REPORTS <span>concept</span></div>{[["MAINTENANCE", "Anomaly review queue", "amber"], ["QUALITY", "Inspection report", "purple"], ["SAFETY", "Environmental threshold", "green"]].map((a) => <div className="alert-line" key={a[0]}><i className={a[2]} /><div><small>{a[0]}</small><strong>{a[1]}</strong></div><ArrowRight size={13} /></div>)}</div></div></div>;
  if (slide === 9) {
    const components = standard
      ? ["Raspberry Pi 5 · 8GB", "Raspberry Pi AI HAT+ 2", "Waveshare ESP32-S3 · RS-485 · PoE · 8DI/8DO", "Dahua IPC-HFW2431SP-S camera", "SHT35 · MQ-135 · SDM120 energy meter", "5V Fixed Output DC-DC Buck Converter", "801S Vibration Sensor", "MH-ET LIVE Barcode Scanner V3.0", "24V DIN-rail PSU & protection", "Enclosure · wiring · terminals allowance"]
      : ["Raspberry Pi 5 · 8GB", "Raspberry Pi AI HAT+ 2", "Jetson Orin Nano Developer Kit Super · 8GB", "Waveshare ESP32-S3 · RS-485 · PoE · 8DI/8DO", "Hikvision DS-2CD2T47G2-L camera", "Sensirion SHT85 · MQ-2 · MQ-5 · MQ-135", "Isolated 4–20 mA / RS-485 interface", "SDM120 single-phase · SDM630 three-phase", "MAX31865 · PT100 · ADXL356* · GM65 barcode", "Mean Well TDR-240-24 · Marsriva KP9 UPS · MSI Spatium 500GB SSD", "Enclosure · wiring · terminals allowance"];
    const software = ["NestJS (Node.js) → Express.js · Fastify · Spring Boot", "Django → FastAPI · Flask · NestJS", "MERN → MEVN · PERN · React + NestJS + PostgreSQL", "PHP (Laravel) → Symfony · CodeIgniter · Django · NestJS"];
    return <div className="hardware-explorer"><div className="hardware-switch"><button className={!standard ? "active" : ""} onClick={() => setStandard(false)}>Premium configuration</button><button className={standard ? "active" : ""} onClick={() => setStandard(true)}>Standard configuration</button></div><div className="hardware-assembly">{components.map((name, i) => { const Icon = [Cpu, Box, Camera, HardDrive][i % 4]; return <div className="hardware-component" key={name} style={{ "--component-order": i } as React.CSSProperties}><div className={`hardware-icon hardware-${i % 4}`}><Icon size={20} /></div><div><small>COMPONENT {String(i + 1).padStart(2, "0")}</small><strong>{name}</strong></div><span className="hardware-link" /></div>; })}</div><div className="software-stack"><small>PROPOSED SOFTWARE ALTERNATIVES · TABLE 3.10</small>{software.map((item) => <span key={item}>{item}</span>)}</div><p className="viz-note">Premium is not mandatory for the Standard pilot. *Report note: ADXL356 listing links to ADXL346; Standard SHT35 is marked “2pic” but budgeted as one item—verify before purchase.</p></div>;
  }
  if (slide === 10) return <div className="roadmap-budget"><div className="roadmap"><div className="roadmap-line" />{[
    ["01", "Requirements & Design", "Requirements · architecture · component selection", "Months 1–2"],
    ["02", "IoT Deployment", "Sensors · edge devices · cameras · validated data acquisition", "Months 3–5"],
    ["03", "AI Model Development", "Anomaly & failure models · OpenCV inspection · model testing", "Months 6–8"],
    ["04", "Dashboard & Pilot", "Dashboard · reports · alerts · ERP/MES link · user testing", "Months 9–10"],
    ["05", "Optimization & Commercialization", "Performance optimization · model refinement · final documentation · commercialization plan", "Months 11–12"],
  ].map((p, i) => <div className="roadmap-phase" key={p[0]}><div className={`roadmap-dot ${i === 0 ? "done" : ""}`}>{p[0]}</div><div><strong>{p[1]}</strong><span>{p[2]}</span></div><small>{p[3]}</small></div>)}</div><div className="budget-cards">{[["PREMIUM BUDGET", "2,315,816.72–2,317,816.72", "Human resources", "BDT 1,980,000", "Software & cloud", "BDT 59,111.72", "Hardware & equipment", "BDT 276,705–278,705"], ["STANDARD BUDGET", "1,392,986.72–1,395,986.72", "Human resources", "BDT 1,245,000", "Software & cloud", "BDT 59,111.72", "Hardware & equipment", "BDT 88,875–91,875"]].map((b) => <div className="budget-card" key={b[0]}><small>{b[0]} · BDT</small><strong>{b[1]}</strong>{[2, 4, 6].map((i) => <div className="budget-row" key={b[i]}><span>{b[i]}</span><b>{b[i + 1]}</b></div>)}</div>)}</div><div className="schedule-note"><AlertTriangle size={16} /><span><b>Schedule discrepancy in report:</b> Table 3.1 describes 12 months; Figure 3.2 is captioned a full 9-month Gantt. Both are preserved here, not reconciled.</span></div></div>;
  return <div className="outcomes-board"><div className="outcome-orbit"><div className="outcome-core">BIIL<span>UNIFIED VIEW</span></div>{["Operational visibility", "Earlier problem detection", "Product quality", "Product traceability", "Energy monitoring", "Workplace safety", "Scalable digitalization"].map((o, i) => <div className="outcome-node" key={o} style={{ "--outcome-angle": `${i * 51.43 - 90}deg` } as React.CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span>{o}</div>)}</div><div className="closing-signoff"><span>PROPOSED OUTCOMES · NOT MEASURED RESULTS</span><strong>Thank you.</strong><p>Questions & discussion</p><div className="closing-supervisor"><SupervisorPortrait /><span>SUPERVISOR</span><b>Md. Habibullah Belali</b></div><TeamStrip /></div></div>;
}

function SlideContent({ slide, selectedDomain, setSelectedDomain, anomaly, setAnomaly, standard, setStandard }: {
  slide: number; selectedDomain: number; setSelectedDomain: (i: number) => void; anomaly: boolean;
  setAnomaly: (v: boolean) => void; standard: boolean; setStandard: (v: boolean) => void;
}) {
  if (slide === 0) return <div className="content-grid opening-grid"><div className="opening-copy"><p className="hero-kicker"><span className="live-indicator" /> SOUTHEAST UNIVERSITY <span>·</span> CSE 460</p><div className="hero-title-wrap"><span className="hero-mark">B<span>.</span></span><h1 className="hero-title">BIIL</h1><div className="hero-rule" /></div><h2>Bangladesh Industrial<br />Intelligence Layer</h2><p className="hero-subtitle">{teamLead}</p><div className="hero-meta"><span>FINAL YEAR DESIGN PROJECT I</span><span>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</span></div><div className="hero-supervisor"><SupervisorPortrait /><div><span>SUPERVISED BY</span><strong>Md. Habibullah Belali</strong><small>Assistant Professor · Department of CSE</small></div></div><TeamStrip /></div><div className="visual-column"><DataViz slide={slide} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} anomaly={anomaly} setAnomaly={setAnomaly} standard={standard} setStandard={setStandard} /><p className="visual-caption"><span>CONCEPTUAL DIGITAL TWIN</span><span>PROPOSED SYSTEM · FYDP-I</span></p></div></div>;
  const copy: Record<number, [string, string, string, string[]]> = {
    1: ["02 / THE INDUSTRIAL PROBLEM", "A factory can be busy—and still be hard to read.", "Seven operational blind spots documented in the report make timely, joined-up decisions difficult.", ["Machine events surface after stoppage", "Quality checks can happen downstream", "Systems hold separate pieces of context"]],
    2: ["03 / THE BIIL VISION", "One factory. Multiple intelligence sources. One unified operational view.", "BIIL is proposed as a modular layer connecting near-machine signals, analysis and the people who act on them.", ["Collect from machines, cameras & sensors", "Validate and process data at the edge", "Present relevant information to authorized users"]],
    3: ["04 / SIX INTELLIGENCE DOMAINS", "Six capabilities. One connected operational picture.", "Select a domain to trace its proposed inputs, processing and outputs.", ["Machine · Production · Quality", "Energy · Environmental & Safety", "Factory Analytics"]],
    4: ["05 / MACHINE INTELLIGENCE", "Move from raw telemetry toward an earlier warning.", "The proposed pipeline validates sensor readings, searches for anomalies and supports maintenance decisions.", ["Inputs: temperature, vibration, current, power & RPM", "Acquisition → validation → anomaly detection", "Prediction and maintenance alerts are planned"]],
    5: ["06 / COMPUTER VISION QUALITY", "A hybrid inspection path—rules plus learned detection.", "The report proposes a camera-to-dashboard pipeline using OpenCV preprocessing and a lightweight detector.", ["Capture and normalize fabric imagery", "Rule-based threshold, morphology & contour checks", "Classify, locate and report candidate defects"]],
    6: ["07 / SAFETY & ENVIRONMENT", "Give safety and environmental signals a place in the same view.", "Proposed monitoring combines camera-based PPE checks with environmental sensors and alerting.", ["PPE and safety-event monitoring", "Temperature, humidity, air quality & gas", "Alerts for authorized factory users"]],
    7: ["08 / SYSTEM ARCHITECTURE", "Four layers carry signals from the factory floor to decisions.", "This view follows Figure 3.3: edge collection, AI/data/integration, application services and authorized clients.", ["Edge: sensors, ESP32 & vision gateway", "AI, operational data, storage & ERP/MES", "Application services, dashboards & role-based access"]],
    8: ["09 / THE BIIL COMMAND CENTER", "Operational context, not another disconnected screen.", "A product-interface concept for bringing machine, production, quality, energy, safety and maintenance views together.", ["Factory overview and line status", "Quality, energy & environmental views", "Alerts, reports & analytics"]],
    9: ["10 / HARDWARE & TECHNOLOGY", "A modular edge kit—with a lower-cost pilot path.", "Compare the report's premium and standard BOM concepts. The proposed software table lists alternatives, not one chosen stack.", ["Standard BOM (§3.2.3): Pi 5 8GB, AI HAT+ 2, Waveshare ESP32-S3 RS-485 PoE 8DI/8DO, Dahua IPC-HFW2431SP-S, SHT35, MQ-135 & SDM120.", "Also: 5V fixed-output DC-DC, 801S vibration, MH-ET LIVE Barcode Scanner V3.0, 24V DIN-rail PSU/protection and enclosure/wiring allowance.", "Report flags ADXL356→ADXL346 source mismatch; Standard SHT35 says “2pic” but is budgeted as one item. Verify both."]],
    10: ["11 / ROADMAP & INVESTMENT", "Five planned phases. Two cost scenarios.", "The report's phase outputs and estimated BDT totals are shown alongside its schedule discrepancy.", ["Timeline and budgets are estimates in the report", "Hardware allowances create budget ranges", "The 9-month / 12-month discrepancy is explicit"]],
    11: ["12 / THE INTENDED OUTCOME", "From fragmented factory operations to unified industrial intelligence.", "BIIL's intended value is clearer operational visibility across machine health, quality, traceability, energy and safety.", ["Proposed platform—not a deployed system", "Prototype development is future work", "Outcomes remain intended, not measured"]],
  };
  const [eyebrow, title, subtitle, bullets] = copy[slide];
  const evidenceLabels: Record<number, string> = {
    1: "DOCUMENTED OPERATIONAL CHALLENGES",
    2: "PROPOSED PLATFORM CONCEPT",
    3: "PROPOSED FUNCTIONAL SCOPE",
    4: "PLANNED DEVELOPMENT PIPELINE",
    5: "PROPOSED INSPECTION FLOW",
    6: "PROPOSED MONITORING SCOPE",
    7: "PROPOSED ARCHITECTURE · FIGURE 3.3",
    8: "ILLUSTRATIVE DEMONSTRATION UI",
    9: "ESTIMATED BOM · PROPOSED TECHNOLOGY OPTIONS",
    10: "PLANNED PHASES · REPORTED ESTIMATES",
    11: "INTENDED OUTCOMES · NOT MEASURED",
  };
  return <div className={`content-grid scene-${slide}`}>
    <div className="slide-copy"><SlideHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="key-points">{bullets.map((item, i) => <div className="key-point" key={item}><span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
      <div className="scope-label"><span className="scope-dot" /> {evidenceLabels[slide]} <span className="scope-divider">/</span> FYDP-I REPORT</div>
    </div>
    <div className="visual-column"><DataViz slide={slide} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} anomaly={anomaly} setAnomaly={setAnomaly} standard={standard} setStandard={setStandard} /><p className="visual-caption"><span>{slide === 7 ? "FIGURE 3.3 · SYSTEM ARCHITECTURE" : slide === 10 ? "ESTIMATES FROM TABLES 3.2–3.8" : "PROPOSED SYSTEM VISUALIZATION"}</span><span>{String(slide + 1).padStart(2, "0")} / 12</span></p></div>
  </div>;
}

export default function Presentation() {
  const [slide, setSlide] = useState(0);
  const [overview, setOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [anomaly, setAnomaly] = useState(false);
  const [standard, setStandard] = useState(false);
  const world = useRef<WorldState>({ stage: 0, reveal: 0 });
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const slideRef = useRef(0);
  const requestedRef = useRef(0);
  const busyRef = useRef(false);
  const transitionStarter = useRef<(target: number) => void>(() => {});
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const introTimelineRef = useRef<gsap.core.Tween | null>(null);
  const reduceMotion = useRef(false);

  const startTransition = useCallback((target: number) => {
    if (target < 0 || target >= chapters.length) return;
    requestedRef.current = target;
    if (busyRef.current) return;
    busyRef.current = true;
    const destination = requestedRef.current;
    if (reduceMotion.current) {
      world.current.stage = destination;
      slideRef.current = destination;
      setSlide(destination);
      busyRef.current = false;
      return;
    }
    introTimelineRef.current?.kill();
    introTimelineRef.current = null;
    timelineRef.current?.kill();
    const tl = gsap.timeline({ onComplete: () => {
      slideRef.current = destination;
      setSlide(destination);
      busyRef.current = false;
      timelineRef.current = null;
      if (requestedRef.current !== destination) transitionStarter.current(requestedRef.current);
    } });
    timelineRef.current = tl;
    tl.to(content.current, { opacity: 0, y: -11, filter: "blur(3px)", duration: 0.36, ease: "power2.in" }, 0)
      .to(world.current, { stage: destination, duration: 1.42, ease: "power3.inOut" }, 0)
      .add(() => {
        slideRef.current = destination;
        setSlide(destination);
        if (content.current) gsap.set(content.current, { y: 14 });
      }, 0.53)
      .to(content.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.58, ease: "power2.out" }, 0.8);
  }, []);

  useEffect(() => { transitionStarter.current = startTransition; }, [startTransition]);

  useLayoutEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion.current) {
      world.current.reveal = 1;
      if (content.current) gsap.set(content.current, { opacity: 1, y: 0 });
      return;
    }
    introTimelineRef.current = gsap.fromTo(content.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.1, delay: 0.55, ease: "power2.out" });
    const reveal = gsap.to(world.current, { reveal: 1, duration: 2.5, delay: 0.2, ease: "power2.out" });
    return () => { introTimelineRef.current?.kill(); reveal.kill(); };
  }, []);

  const navigate = useCallback((delta: number) => {
    const base = busyRef.current ? requestedRef.current : slideRef.current;
    const target = Math.max(0, Math.min(chapters.length - 1, base + delta));
    if (busyRef.current) requestedRef.current = target;
    else startTransition(target);
  }, [startTransition]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await root.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch { /* Browser or projector policy may disallow fullscreen. */ }
  }, []);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); navigate(1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
      else if (event.key === "Escape") { if (overview) setOverview(false); else if (document.fullscreenElement) void document.exitFullscreen(); }
      else if (event.key.toLowerCase() === "o") setOverview((v) => !v);
      else if (event.key.toLowerCase() === "n") setNotes((v) => !v);
      else if (event.key.toLowerCase() === "f") void enterFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("keydown", onKey);
      timelineRef.current?.kill();
    };
  }, [enterFullscreen, navigate, overview]);

  return <main className={`presentation ${isFullscreen ? "fullscreen" : ""}`} ref={root}>
    <div className="world-canvas" aria-hidden="true"><Canvas fallback={<div className="webgl-fallback"><span>3D VIEW UNAVAILABLE</span><small>Presentation content and controls remain available.</small></div>} dpr={[1, 1.55]} camera={{ position: [0, 3.1, 9.4], fov: 43 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}><IndustrialWorld world={world} /></Canvas></div>
    <div className="atmosphere" aria-hidden="true" />
    <div className="topbar"><a className="brand" href="#presentation" aria-label="BIIL presentation home"><span className="brand-symbol">B<span>.</span></span><span className="brand-name">BIIL<small>INDUSTRIAL INTELLIGENCE</small></span></a><div className="top-center"><span className="status-dot" /> <span>PROJECT DEFENSE</span><i /> <span>SOUTHEAST UNIVERSITY</span></div><div className="top-actions"><span className="course-pill">FYDP-I <i /> CSE 460</span><button className="icon-button" onClick={() => setNotes((v) => !v)} aria-label="Toggle presenter notes"><CircleHelp size={17} /></button><button className="icon-button" onClick={() => setOverview(true)} aria-label="Open slide overview"><Layers3 size={17} /></button><button className="icon-button" onClick={() => void enterFullscreen()} aria-label="Toggle fullscreen">{isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}</button></div></div>
    <div className="slide-stage" id="presentation"><div className="world-vignette" /><div ref={content} className="slide-content"><AnimatePresence mode="wait"><motion.div key={slide} className="scene-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}><SlideContent slide={slide} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} anomaly={anomaly} setAnomaly={setAnomaly} standard={standard} setStandard={setStandard} /></motion.div></AnimatePresence></div></div>
    {notes && <aside className="presenter-note"><button onClick={() => setNotes(false)} aria-label="Close notes"><X size={15} /></button><small>PRESENTER NOTE</small><p>All BIIL functions are proposed in the FYDP-I report. The dashboard and sensor values in this presentation are illustrative demonstrations, not results from a deployed system.</p></aside>}
    <footer className="control-bar"><div className="slide-ident"><span>{String(slide + 1).padStart(2, "0")}</span><i />{chapters[slide]}</div><div className="progress-track" aria-label={`Slide ${slide + 1} of ${chapters.length}`}><div className="progress-fill" style={{ width: `${((slide + 1) / chapters.length) * 100}%` }} />{chapters.map((name, i) => <button key={name} style={{ left: `${(i / (chapters.length - 1)) * 100}%` }} className={`progress-mark ${i === slide ? "active" : ""}`} onClick={() => startTransition(i)} aria-label={`Go to slide ${i + 1}: ${name}`} />)}</div><div className="nav-controls"><button className="nav-button" onClick={() => navigate(-1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={16} /></button><span>{String(slide + 1).padStart(2, "0")}<i>/</i>12</span><button className="nav-button next" onClick={() => navigate(1)} disabled={slide === 11} aria-label="Next slide"><ArrowRight size={16} /></button></div></footer>
    <div className="keyboard-hint"><span>←</span><span>→</span> TO NAVIGATE <i /> O OVERVIEW <i /> F FULLSCREEN</div>
    {overview && <div className="overview-backdrop" role="dialog" aria-modal="true" aria-label="Slide overview" onClick={(e) => { if (e.target === e.currentTarget) setOverview(false); }}><div className="overview-panel"><div className="overview-heading"><div><small>PRESENTATION MAP</small><h2>All scenes</h2></div><button className="icon-button" onClick={() => setOverview(false)} aria-label="Close overview"><X size={18} /></button></div><div className="overview-grid">{chapters.map((name, i) => <button className={`overview-card ${slide === i ? "current" : ""}`} key={name} onClick={() => { setOverview(false); startTransition(i); }}><span>{String(i + 1).padStart(2, "0")}</span><strong>{name}</strong><ArrowRight size={14} /></button>)}</div></div></div>}
  </main>;
}
