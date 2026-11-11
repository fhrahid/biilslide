"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bolt,
  Box, BookOpen, Camera, CircleHelp, Cpu,
  Download, FileText, HardDrive, Layers3, Maximize, Minimize, Network, ScanLine, Shield,
  Target, X,
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
  "Project overview", "Problem statement", "Project objectives", "Literature review",
  "Research gap & BIIL", "Methodology & plan", "Vision inspection plan",
  "System architecture", "Resources & budget", "Expected deliverables",
  "Timeline & budget", "Conclusion",
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

const gapResponses = [
  { title: "Local factory realities", label: "AFFORDABILITY", detail: "Many smart-factory solutions target large plants, not local cost, infrastructure and operating conditions.", response: "Design an affordable, modular RMG pilot." },
  { title: "Single-function systems", label: "INTEGRATION", detail: "Existing work often addresses one function instead of a joined-up factory view.", response: "Unify the six intelligence domains." },
  { title: "Variable factory images", label: "REAL-WORLD DATA", detail: "Lighting, fabric, camera position and production conditions challenge model transfer.", response: "Propose a hybrid OpenCV + learned pipeline." },
  { title: "Fragmented information", label: "OPERATIONAL SILOS", detail: "Machine, quality, production, energy and safety information can remain disconnected.", response: "Bring operational data into one layer." },
  { title: "ERP/MES continuity", label: "MODULAR SCALE", detail: "SMEs need to start with a pilot and keep their existing factory systems.", response: "Scale alongside ERP/MES, not replace them." },
];

const objectiveGroups = [
  { title: "MONITOR", accent: "#66d8cb", items: ["Machine condition and production activity", "Energy use and environmental conditions"] },
  { title: "DETECT", accent: "#b59bff", items: ["Abnormal behaviour and potential failure", "Product defects with OpenCV inspection"] },
  { title: "TRACK & PROTECT", accent: "#f2b76f", items: ["Products with barcode / RFID", "PPE compliance and safety alerts"] },
  { title: "INTEGRATE", accent: "#7bb9ff", items: ["Dashboards, reports and recommendations", "Existing ERP / MES systems"] },
];

const literature = [
  { tag: "FABRIC-DEFECT REVIEW", title: "Traditional and learned methods", refs: "Guo et al. · [5]" },
  { tag: "REAL-WORLD FABRIC STUDY", title: "Results depend on factory images", refs: "Nasim et al. · [6]" },
  { tag: "COMPANY CASE STUDY · BMW", title: "Predictive maintenance and AI inspection", refs: "BMW Group · [1] [2]" },
  { tag: "COMPANY CASE STUDY · SCHNEIDER ELECTRIC", title: "Connected energy monitoring", refs: "World Economic Forum · [8]" },
];

const deliverables = [
  ["FYDP-I · DESIGN PACKAGE", "Requirement specification · architecture · use-case / data-flow diagrams · component selection"],
  ["PHASE 2 · PLANNED", "Sensors, edge devices and cameras; data acquisition and validation pipeline"],
  ["PHASE 3 · PLANNED", "Anomaly / failure models; OpenCV defect inspection and model testing"],
  ["PHASE 4 · PLANNED", "Dashboard, reports, alerts and ERP/MES link; pilot and user testing"],
  ["PHASE 5 · PLANNED", "Performance optimization, model refinement, documentation and commercialization plan"],
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
  if (index === 7) return <group ref={group} position={[x + 3.5, 1.4, -1]}>
    {[
      { name: "INDUSTRIAL EDGE", color: "#36896d", module: "#76d1a1" },
      { name: "AI · DATA", color: "#6a56a1", module: "#b89af0" },
      { name: "APPLICATION", color: "#247f86", module: "#66d4cb" },
      { name: "CLIENT", color: "#315b85", module: "#84c2f5" },
    ].map((layer, i) => {
      const y = i * 0.95 - 1.425;
      return <group key={layer.name} position={[0, y, 0]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[4.6, 0.16, 1.55]} /><meshStandardMaterial color={layer.color} transparent opacity={0.86} metalness={0.52} roughness={0.32} emissive={layer.color} emissiveIntensity={0.22} /></mesh>
        <mesh position={[-2.18, 0.12, 0]}><boxGeometry args={[0.08, 0.28, 1.42]} /><meshBasicMaterial color={layer.module} /></mesh>
        {[-1.42, 0, 1.42].map((offset, j) => <group key={j} position={[offset, 0.22, 0.08]}>
          <mesh><boxGeometry args={[1.25, 0.28, 0.92]} /><meshStandardMaterial color={layer.module} transparent opacity={0.94} metalness={0.35} roughness={0.38} emissive={layer.module} emissiveIntensity={0.2} /></mesh>
          <mesh position={[0, 0.15, 0.02]}><boxGeometry args={[0.92, 0.025, 0.66]} /><meshBasicMaterial color={i === 0 ? "#b7ebce" : "#c3e7e4"} transparent opacity={0.48} /></mesh>
          <mesh position={[0.48, 0.17, 0.3]}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color={j === 1 ? "#ffc16d" : "#8ffff0"} /></mesh>
        </group>)}
      </group>;
    })}
    <mesh position={[0, 0.25, 2.45]}><boxGeometry args={[0.055, 2.85, 0.045]} /><meshBasicMaterial color="#45d5ca" transparent opacity={0.4} /></mesh>
    <Signal start={[0, -1.43, 0.82]} end={[0, -0.48, 0.82]} delay={0} />
    <Signal start={[0, -0.48, 0.82]} end={[0, 0.47, 0.82]} delay={0.28} />
    <Signal start={[0, 0.47, 0.82]} end={[0, 1.42, 0.82]} delay={0.56} />
    <pointLight position={[0, 0.1, 3]} intensity={14} distance={9} color="#38bfc0" />
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
    camera.position.y = THREE.MathUtils.damp(camera.position.y, stage === 0 || stage === 11 ? 3.7 : stage === 7 ? 3 : 3.2, 2, 1 / 60);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, stage === 0 || stage === 11 ? 12.6 : stage === 7 ? 9.6 : 11.4, 2, 1 / 60);
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
    <div className="team-roster-grid">{team.map((person, index) => <div className="team-member" key={person.name} aria-label={`Team member ${person.name}`}>
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

function RoadmapBudgetViz({ standard, setStandard }: { standard: boolean; setStandard: (value: boolean) => void }) {
  const phases = [
    { id: "01", title: "Requirements & Design", start: 0, duration: 3, months: "M1–M3" },
    { id: "02", title: "IoT Deployment", start: 3, duration: 1.5, months: "M3–M5" },
    { id: "03", title: "AI Model Development", start: 4.5, duration: 1.5, months: "M5–M6" },
    { id: "04", title: "Dashboard & Pilot", start: 6, duration: 1.5, months: "M6–M8" },
    { id: "05", title: "Optimization & Commercialization", start: 7.5, duration: 1.5, months: "M8–M9" },
  ];
  const budgets = [
    { key: "premium", name: "PREMIUM", total: "2,315,816.72", share: 100, people: "1,980,000", software: "59,111.72", hardware: "276,705" },
    { key: "standard", name: "STANDARD", total: "1,392,986.72", share: 60.2, people: "1,245,000", software: "59,111.72", hardware: "88,875" },
  ];
  const budget = budgets[standard ? 1 : 0];
  return <div className="roadmap-budget-viz">
    <section className="gantt-panel" aria-label="Project timeline">
      <div className="gantt-heading"><div><small>PROJECT ROADMAP</small><strong>Planned 9-month sequence</strong></div><span>FYDP-I DESIGN ✓</span></div>
      <div className="gantt-months"><span aria-hidden="true" /><div className="gantt-month-scale">{Array.from({ length: 9 }, (_, i) => <span key={i}>M{i + 1}</span>)}</div></div>
      <div className="gantt-chart">
        <div className="gantt-now"><span>WE ARE HERE</span></div>
        {phases.map((phase, i) => <div className="gantt-row" key={phase.id}>
          <div className="gantt-phase"><small>{phase.id}</small><strong>{phase.title}</strong><span>{phase.months}</span></div>
          <div className="gantt-track"><i className={`gantt-bar phase-${i + 1} ${i === 0 ? "complete" : "planned"}`} style={{ left: `${(phase.start / 9) * 100}%`, width: `${(phase.duration / 9) * 100}%` }} /></div>
        </div>)}
      </div>
    </section>
    <section className="budget-panel" aria-label="Premium and Standard budget estimates">
      <header><small>BASE ESTIMATE · BDT</small><strong>Budget scenarios</strong></header>
      <div className="timeline-budget-tabs" role="tablist" aria-label="Choose budget scenario"><button data-budget-tab="premium" role="tab" aria-selected={!standard} className={!standard ? "active" : ""} onClick={() => setStandard(false)}>Premium</button><button data-budget-tab="standard" role="tab" aria-selected={standard} className={standard ? "active" : ""} onClick={() => setStandard(true)}>Standard</button></div>
      <div className={`budget-comparison ${standard ? "standard" : "premium"}`}><div className="budget-comparison-heading"><span>{budget.name} BASE</span><b>{budget.total}</b></div><div className="budget-comparison-track"><i style={{ width: `${budget.share}%` }} /></div><div className="budget-breakdown"><span>Human resources <b>BDT {budget.people}</b></span><span>Software & cloud <b>BDT {budget.software}</b></span><span>Hardware & equipment <b>BDT {budget.hardware}</b></span></div></div>
      <div className="budget-mini-compare">{budgets.map((item) => <div className={item.key} key={item.key}><span>{item.name}</span><i style={{ width: `${item.share}%` }} /></div>)}</div>
      <p className="budget-saving">Standard is about 40% lower. Software and cloud cost is the same in both plans. Totals use the lower enclosure/wiring allowance.</p>
    </section>
  </div>;
}

function DeliverablesViz() {
  return <div className="deliverables-board"><div className="deliverables-intro"><span>EXPECTED FINAL PRODUCT · PROPOSED</span><strong>BIIL working prototype</strong><p>Edge hardware kit + central platform + AI models + web dashboard</p></div><div className="deliverable-list">{deliverables.map((item, i) => <div className="deliverable-card" key={item[0]} role="group" aria-label={`${item[0]}: ${item[1]}`}><span>{String(i + 1).padStart(2, "0")}</span><div><small>{item[0]}</small><p>{item[1]}</p></div><ArrowRight size={15} /></div>)}</div><div className="user-roles"><small>INTENDED FACTORY USERS</small><span>Manager</span><span>Production Supervisor</span><span>Maintenance Engineer</span><span>Quality Inspector</span><span>Factory Worker</span></div><p className="viz-note">These are planned outputs and users in the report, not completed deployments.</p></div>;
}

function ArchitectureDiagram() {
  const layers = [
    { id: "04", name: "CLIENT LAYER", descriptor: "Web and responsive interfaces", modules: ["Factory dashboard", "Reports & alerts", "Role-based access"], order: 3, color: "#7bb9ff" },
    { id: "03", name: "APPLICATION LAYER", descriptor: "BIIL backend services", modules: ["Device & data services", "Factory operations", "Alerts & integration"], order: 2, color: "#54d5c7" },
    { id: "02", name: "AI, DATA & INTEGRATION", descriptor: "Analysis, storage and system links", modules: ["AI services", "Operational database", "ERP / MES"], order: 1, color: "#b99aff" },
    { id: "01", name: "INDUSTRIAL EDGE LAYER", descriptor: "Near-machine collection and processing", modules: ["Machine & product sensors", "Environment & safety", "ESP32 + vision gateway"], order: 0, color: "#7bd1a6" },
  ];
  return <div className="architecture-presentation">
    <div className="architecture-flow-caption"><span>SECURE DATA PATH</span> COLLECT <ArrowRight size={13} /> EDGE PROCESSING <ArrowRight size={13} /> CENTRAL BIIL <ArrowRight size={13} /> DASHBOARDS / ALERTS <ArrowRight size={13} /> ERP / MES</div>
    <div className="architecture-stack-view">
      <div className="architecture-data-beam" aria-hidden="true"><i /></div>
      {layers.map((layer) => <div className="architecture-layer-dom" key={layer.id} style={{ "--layer-color": layer.color, "--layer-order": layer.order } as React.CSSProperties}>
        <div className="architecture-layer-heading"><span>{layer.id}</span><strong>{layer.name}</strong><small>{layer.descriptor}</small></div>
        <div className="architecture-layer-modules">{layer.modules.map((module) => <span key={module}>{module}</span>)}</div>
      </div>)}
      <div className="architecture-protocol"><span>MQTT / HTTPS over TLS</span><i /> timestamps · device IDs · validated records</div>
    </div>
  </div>;
}

function MethodologyFlow() {
  const stations = [
    { x: 14, id: "01", title: "COLLECT", lines: ["Sensors + cameras", "Barcode / RFID"], color: "#79d8c5" },
    { x: 166, id: "02", title: "VALIDATE AT EDGE", lines: ["Check + preprocess", "Buffer at source"], color: "#8bc8ff" },
    { x: 318, id: "03", title: "TRANSMIT SECURELY", lines: ["MQTT / HTTPS", "TLS · device IDs"], color: "#f0be75" },
    { x: 470, id: "04", title: "PROCESS + STORE", lines: ["AI services", "Database · media"], color: "#c5a1ff" },
    { x: 622, id: "05", title: "DELIVER", lines: ["Dashboards + alerts", "Reports · ERP / MES"], color: "#72d8ce" },
  ];
  return <div className="method-flow-shell">
    <div className="method-flow-topline"><span><i /> LIVE DATA PATH</span><small>EDGE → CENTRAL → OPERATIONS</small></div>
    <svg className="method-flow-svg" viewBox="0 0 760 370" role="img" aria-labelledby="method-flow-title method-flow-description">
      <title id="method-flow-title">BIIL end-to-end methodology data flow</title>
      <desc id="method-flow-description">Animated sensor and camera data passes through edge validation, secure transport, AI and storage, then reaches factory dashboards, alerts, reports, and ERP or MES systems.</desc>
      <defs>
        <linearGradient id="methodFlowGradient" x1="0" x2="1"><stop offset="0" stopColor="#73d8c4" /><stop offset=".52" stopColor="#79bcff" /><stop offset="1" stopColor="#c5a1ff" /></linearGradient>
        <radialGradient id="methodNodeGlow"><stop stopColor="#75d9cc" stopOpacity=".2" /><stop offset="1" stopColor="#75d9cc" stopOpacity="0" /></radialGradient>
        <pattern id="methodGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#a4d3d1" strokeOpacity=".055" strokeWidth=".6" /></pattern>
        <filter id="methodGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x="1" y="1" width="758" height="368" rx="8" fill="#071117" fillOpacity=".82" stroke="#7bb7b2" strokeOpacity=".2" />
      <rect x="2" y="2" width="756" height="366" rx="7" fill="url(#methodGrid)" />
      <circle cx="380" cy="204" r="160" fill="url(#methodNodeGlow)" opacity=".35" />
      <path d="M35 73H725" className="method-flow-track" />
      <path d="M35 73H725" className="method-flow-trace" />
      <path d="M35 73H725" className="method-flow-trace method-flow-trace-alt" />
      {stations.map((station, i) => {
        const cx = station.x + 68;
        return <g key={station.id} className={`method-station station-${i + 1}`} style={{ "--station-delay": `${i * 0.32}s`, "--station-color": station.color } as React.CSSProperties}>
          <path d={`M${cx} 73V112`} className="method-flow-branch" />
          <circle cx={cx} cy="73" r="5" className="method-flow-port" />
          <rect x={station.x} y="112" width="136" height="184" rx="5" className="method-station-card" />
          <path d={`M${station.x + 1} 117H${station.x + 135}`} className="method-station-accent" />
          <text x={station.x + 12} y="136" className="method-station-id">{station.id}</text>
          <text x={cx} y="169" textAnchor="middle" className="method-station-title">{station.title}</text>
          <g className="method-station-core" filter="url(#methodGlow)">
            <circle cx={cx} cy="207" r="18" className="method-core-orbit" />
            <circle cx={cx} cy="207" r="10" className="method-core-dot" />
            <path d={`M${cx - 5} 207H${cx + 5}M${cx} 202V212`} className="method-core-cross" />
          </g>
          <text x={cx} y="250" textAnchor="middle" className="method-station-detail">{station.lines[0]}</text>
          <text x={cx} y="267" textAnchor="middle" className="method-station-detail">{station.lines[1]}</text>
        </g>;
      })}
      <g className="method-output-chip" transform="translate(60 320)"><rect width="200" height="31" rx="3" /><circle cx="15" cy="15.5" r="3.5" /><text x="31" y="20">MACHINE + PRODUCT</text></g>
      <g className="method-output-chip" transform="translate(280 320)"><rect width="200" height="31" rx="3" /><circle cx="15" cy="15.5" r="3.5" /><text x="31" y="20">QUALITY + ENERGY</text></g>
      <g className="method-output-chip" transform="translate(500 320)"><rect width="200" height="31" rx="3" /><circle cx="15" cy="15.5" r="3.5" /><text x="31" y="20">SAFETY + OPERATIONS</text></g>
    </svg>
    <div className="method-flow-legend"><span><i className="legend-signal" /> telemetry + images</span><span><i className="legend-secure" /> encrypted transport</span><span><i className="legend-action" /> operational outputs</span></div>
  </div>;
}

function GapExplorer({ selectedGap, setSelectedGap }: { selectedGap: number; setSelectedGap: (index: number) => void }) {
  const colors = ["#74d9c8", "#7bb9ff", "#c4a3ff", "#ffd07a", "#88d8ff"];
  const icons = [Activity, Layers3, ScanLine, Network, HardDrive];
  return <div className="domain-explorer gap-explorer">
    <div className="domain-orbit">
      <div className="orbit-core">BIIL<span>RESEARCH GAP</span></div>
      <div className="orbit-ring" />
      {gapResponses.map((gap, i) => {
        const Icon = icons[i];
        return <button key={gap.title} data-slide-interaction data-activate-on-arrow tabIndex={0} aria-pressed={selectedGap === i} className={`orbit-node ${selectedGap === i ? "selected" : ""}`} style={{ "--angle": `${i * 72 - 90}deg`, "--node-index": i, "--domain-color": colors[i] } as React.CSSProperties} onClick={() => setSelectedGap(i)} aria-label={`Explore gap ${i + 1}: ${gap.title}`}>
          <Icon className="orbit-node-icon" size={19} />
          <span className="orbit-node-number">{String(i + 1).padStart(2, "0")}</span>
          <span className="orbit-node-label">{gap.label}</span>
          <div className="orbit-expanded-content"><strong>{gap.title}</strong><small>DOCUMENTED GAP</small><p>{gap.detail}</p></div>
        </button>;
      })}
    </div>
    <div className="domain-detail gap-detail">
      <div className="domain-detail-heading"><span className="domain-number">0{selectedGap + 1}</span><div><strong>{gapResponses[selectedGap].title}</strong><span>{gapResponses[selectedGap].label}</span></div></div>
      <div className="gap-response-copy"><small>BIIL RESPONSE</small><p>{gapResponses[selectedGap].response}</p></div>
    </div>
  </div>;
}

function DataViz({ slide, selectedGap, setSelectedGap, standard, setStandard }: {
  slide: number; selectedGap: number; setSelectedGap: (i: number) => void;
  standard: boolean; setStandard: (v: boolean) => void;
}) {
  if (slide === 0) return <div className="hero-stats">{[["01", "UNIFIED", "industrial intelligence layer"], ["02", "MODULAR", "pilot line to wider scale"], ["03", "PROPOSED", "FYDP-I system design"]].map((item) => <div key={item[0]} role="group" aria-label={`${item[1]}: ${item[2]}`}><span>{item[0]}</span><strong>{item[1]}</strong><small>{item[2]}</small></div>)}</div>;
  if (slide === 1) return <div className="problem-board"><div className="problem-board-top"><span>OPERATIONAL SIGNALS</span><span className="status muted"><i /> DISCONNECTED VIEW</span></div><div className="problem-lines">{problems.map((p, i) => <div className="problem-row" key={p[0]} role="group" aria-label={p[0]}><span className="problem-index">{p[2]}</span><strong className="problem-label">{p[0]}</strong><div className="problem-graph"><i style={{ width: `${29 + (i * 19) % 68}%`, animationDelay: `${i * 0.12}s` }} /></div><span className="problem-warning"><AlertTriangle size={14} /></span></div>)}</div><p className="viz-note">Seven operational problems identified in the project.</p></div>;
  if (slide === 2) return <div className="objective-columns">{objectiveGroups.map((group, i) => <section className="objective-column" key={group.title} style={{ "--objective-color": group.accent, "--objective-index": i } as React.CSSProperties}><header><Target size={17} /><span>0{i + 1}</span><strong>{group.title}</strong></header><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>;
  if (slide === 3) return <div className="literature-board">{literature.map((item, i) => <article className="literature-card" key={item.title} role="group" aria-label={`${item.tag}: ${item.title}. ${item.refs}`}><div className="literature-card-head"><BookOpen size={15} /><span>0{i + 1}</span><small>{item.tag}</small></div><h3>{item.title}</h3><footer><FileText size={13} />{item.refs}</footer></article>)}</div>;
  if (slide === 4) return <GapExplorer selectedGap={selectedGap} setSelectedGap={setSelectedGap} />;
  if (slide === 5) return <MethodologyFlow />;
  if (slide === 6) return <div className="vision-demo"><div className="vision-head"><span><Camera size={15} /> INDUSTRIAL INSPECTION · CONCEPT</span><span className="demo-tag">PROPOSED PIPELINE</span></div><div className="fabric-scan"><div className="fabric-texture" /><div className="scan-beam" /><div className="fabric-defect defect-one" /><div className="fabric-defect defect-two" /><div className="detection-box"><span>DEFECT REGION</span></div><div className="scan-camera"><Camera size={18} /><span>FIXED CAMERA</span></div><div className="scan-caption">SCANNING SURFACE · SCHEMATIC</div></div><div className="pipeline-steps">{[["01", "Capture", "Industrial camera"], ["02", "Preprocess", "OpenCV · ROI"], ["03", "Rule checks", "Threshold · morphology"], ["04", "Learned detection", "Lightweight model"], ["05", "Report", "Type · location · confidence"]].map((s, i) => <div className={`pipeline-step ${i === 2 ? "active" : ""}`} key={s[0]} role="group" aria-label={`${s[1]}: ${s[2]}`}><small>{s[0]}</small><strong>{s[1]}</strong><span>{s[2]}</span></div>)}</div><p className="viz-note">Proposed hybrid pipeline · no BIIL model performance is claimed.</p></div>;
  if (slide === 7) return <ArchitectureDiagram />;
  if (slide === 8) {
    const components = standard
      ? ["Raspberry Pi 5 · 8GB", "Raspberry Pi AI HAT+ 2", "Waveshare ESP32-S3 · RS-485 · PoE · 8DI/8DO", "Dahua IPC-HFW2431SP-S camera", "SHT35 · MQ-135 · SDM120 energy meter", "5V Fixed Output DC-DC Buck Converter", "801S Vibration Sensor", "MH-ET LIVE Barcode Scanner V3.0", "24V DIN-rail PSU & protection", "Enclosure · wiring · terminals allowance"]
      : ["Raspberry Pi 5 · 8GB", "Raspberry Pi AI HAT+ 2", "Jetson Orin Nano Developer Kit Super · 8GB", "Waveshare ESP32-S3 · RS-485 · PoE · 8DI/8DO", "Hikvision DS-2CD2T47G2-L camera", "Sensirion SHT85 · MQ-2 · MQ-5 · MQ-135", "Isolated 4–20 mA / RS-485 interface", "SDM120 single-phase · SDM630 three-phase", "MAX31865 · PT100 · ADXL356* · GM65 barcode", "Mean Well TDR-240-24 · Marsriva KP9 UPS · MSI Spatium 500GB SSD", "Enclosure · wiring · terminals allowance"];
    const software = ["NestJS (Node.js) → Express.js · Fastify · Spring Boot", "Django → FastAPI · Flask · NestJS", "MERN → MEVN · PERN · React + NestJS + PostgreSQL", "PHP (Laravel) → Symfony · CodeIgniter · Django · NestJS"];
    const budgetSummaries = [
      ["PREMIUM BASE ESTIMATE", "BDT 2,315,816.72", "HR 1,980,000 · software 59,111.72 · hardware 276,705"],
      ["STANDARD BASE ESTIMATE", "BDT 1,392,986.72", "HR 1,245,000 · software 59,111.72 · hardware 88,875"],
    ];
    return <div className="hardware-explorer"><div className="hardware-switch"><button data-budget-tab="premium" aria-label="Premium budget hardware configuration" aria-pressed={!standard} className={!standard ? "active" : ""} onClick={() => setStandard(false)}>Premium budget</button><button data-budget-tab="standard" aria-label="Standard budget hardware configuration" aria-pressed={standard} className={standard ? "active" : ""} onClick={() => setStandard(true)}>Standard budget</button></div><div className="hardware-assembly">{components.map((name, i) => { const Icon = [Cpu, Box, Camera, HardDrive][i % 4]; return <div className="hardware-component" key={name} role="group" aria-label={name} style={{ "--component-order": i } as React.CSSProperties}><div className={`hardware-icon hardware-${i % 4}`}><Icon size={20} /></div><div><small>COMPONENT {String(i + 1).padStart(2, "0")}</small><strong>{name}</strong></div><span className="hardware-link" /></div>; })}</div><div className="software-stack"><small>PROPOSED SOFTWARE ALTERNATIVES</small>{software.map((item) => <span key={item}>{item}</span>)}</div><div className="hardware-budget">{budgetSummaries.map((item) => <div className="hardware-budget-card" key={item[0]} role="group" aria-label={`${item[0]} ${item[1]}`}><small>{item[0]}</small><strong>{item[1]}</strong><span>{item[2]}</span></div>)}</div><p className="viz-note">Premium options are not required for the Standard pilot. Base estimates use the lower enclosure and wiring allowance.</p></div>;
  }
  if (slide === 9) return <DeliverablesViz />;
  if (slide === 10) return <RoadmapBudgetViz standard={standard} setStandard={setStandard} />;
  return <div className="outcomes-board"><div className="outcome-orbit"><div className="outcome-core">BIIL<span>UNIFIED VIEW</span></div>{["Operational visibility", "Earlier problem detection", "Product quality", "Product traceability", "Energy monitoring", "Workplace safety", "Scalable digitalization"].map((o, i) => <div className="outcome-node" key={o} role="group" aria-label={o} style={{ "--outcome-angle": `${i * 51.43 - 90}deg` } as React.CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span>{o}</div>)}</div><div className="closing-signoff"><span>PROPOSED OUTCOMES · NOT MEASURED RESULTS</span><strong>Thank you.</strong><p>Questions & discussion</p><div className="closing-supervisor"><SupervisorPortrait /><span>SUPERVISOR</span><b>Md. Habibullah Belali</b></div><TeamStrip /></div></div>;
}

function OpeningSlide({ selectedGap, setSelectedGap, standard, setStandard }: {
  selectedGap: number; setSelectedGap: (i: number) => void; standard: boolean; setStandard: (v: boolean) => void;
}) {
  return <div className="content-grid opening-grid">
    <div className="opening-copy">
      <p className="hero-kicker"><span className="live-indicator" /> SOUTHEAST UNIVERSITY <span>·</span> CSE 460</p>
      <div className="hero-title-wrap"><span className="hero-mark">B<span>.</span></span><h1 className="hero-title">BIIL</h1><div className="hero-rule" /></div>
      <h2>Bangladesh Industrial<br />Intelligence Layer</h2>
      <p className="hero-subtitle">{teamLead}</p>
      <div className="hero-meta"><span>FINAL YEAR DESIGN PROJECT I</span><span>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</span></div>
    </div>
    <div className="visual-column opening-visual-column">
      <section className="opening-team-panel" aria-label="Project supervisor and team">
        <div className="hero-supervisor"><SupervisorPortrait /><div><span>SUPERVISED BY</span><strong>Md. Habibullah Belali</strong><small>Assistant Professor · Department of Computer Science & Engineering</small></div></div>
        <TeamStrip />
      </section>
      <DataViz slide={0} selectedGap={selectedGap} setSelectedGap={setSelectedGap} standard={standard} setStandard={setStandard} />
      <p className="visual-caption"><span>CONCEPTUAL DIGITAL TWIN</span><span>PROPOSED SYSTEM · FYDP-I</span></p>
    </div>
  </div>;
}

function SlideContent({ slide, selectedGap, setSelectedGap, standard, setStandard }: {
  slide: number; selectedGap: number; setSelectedGap: (i: number) => void; standard: boolean; setStandard: (v: boolean) => void;
}) {
  if (slide === 0) return <OpeningSlide selectedGap={selectedGap} setSelectedGap={setSelectedGap} standard={standard} setStandard={setStandard} />;
  const copy: Record<number, [string, string, string, string[]]> = {
    1: ["02 / PROBLEM & MOTIVATION", "What if a factory could see a machine failure before it happens?", "RMG and textiles power Bangladesh's manufacturing economy, yet many factories rely on manual records and disconnected software.", ["Unexpected breakdowns · no real-time monitoring · late defect detection", "Energy waste · poor product traceability · safety risks", "Scattered factory data and a lack of affordable local smart-factory options"]],
    2: ["03 / AIM & OBJECTIVES", "What BIIL is designed to help a factory do.", "The project aims to design an affordable industrial platform for garment, textile and other factories in Bangladesh.", ["Monitor machine condition and production; detect anomalies and support failure prediction", "Inspect quality; track products; monitor energy and environment", "Improve safety with PPE monitoring; provide dashboards, reports, recommendations and ERP/MES support"]],
    3: ["04 / LITERATURE REVIEW", "Company cases and research inform the design.", "Two fabric-inspection papers and two factory examples ground BIIL's proposed scope.", ["BMW applies sensor-led maintenance and AI vision inspection", "Schneider Electric uses connected data for energy management and waste reduction", "Fabric studies inform hybrid inspection; results are not BIIL performance claims"]],
    4: ["05 / RESEARCH GAP & BIIL RESPONSE", "A modular intelligence layer for local factory realities.", "The report identifies affordability, fragmented single-function systems, variable factory imagery and ERP/MES continuity as gaps.", ["Unify machine, production, quality, energy, safety and analytics", "Begin with a pilot line and scale modularly", "Complement existing ERP/MES systems rather than replace them"]],
    5: ["06 / METHODOLOGY & PLAN", "A validated data path from the line to an operational decision.", "The proposed method combines edge collection and validation with central AI/data services and role-aware delivery.", ["Collect from sensors, cameras and product scanners", "Validate and preprocess at the edge; transmit securely", "Analyze, store and deliver dashboards, alerts, reports and integrations"]],
    6: ["07 / OPENCV INSPECTION PIPELINE", "Hybrid fabric inspection: rules plus learned detection.", "The proposed pipeline combines OpenCV capture/preprocessing and rule-based checks with a lightweight detector.", ["Capture and normalize illumination; select a region of interest", "Threshold, morphology and contour/edge checks flag simple defects", "Classify and report type, location and confidence; evaluate precision, recall, mAP, fps and false alarms"]],
    7: ["08 / SYSTEM ARCHITECTURE", "Four layers carry data from industrial edge to authorized users.", "Industrial Edge → AI, Data & Integration → Application → Client.", ["Sensors, ESP32 and vision gateway", "AI services, operational database, image/report storage and ERP/MES", "Device/data services, factory operations, alerts and role-based clients"]],
    8: ["09 / RESOURCES & CONFIGURATIONS", "Two equipment plans support different pilot scopes.", "The Premium and Standard configurations use documented alternatives; the software list is proposed, not a selected production stack.", ["Standard estimate BDT 1,392,986.72; Pi 5 8GB, AI HAT+ 2, ESP32-S3, Dahua camera and core sensing", "Premium estimate BDT 2,315,816.72; adds Jetson Orin Nano Super, Hikvision camera and broader sensing", "Standard baseline is about 40% lower; software/cloud estimate is the same in both plans"]],
    9: ["10 / EXPECTED DELIVERABLES", "A proposed prototype spanning edge, AI and factory operations.", "FYDP-I documents the design package; later development, pilot and deployment remain planned work.", ["Design package: requirements, architecture and component selection", "Planned edge pipeline, anomaly/failure models and OpenCV inspection", "Planned dashboard, reports, ERP/MES link, pilot tests and final prototype"]],
    10: ["11 / TIMELINE & BUDGET", "A nine-month plan from requirements to commercialization.", "The full-project schedule completes FYDP-I design by Month 3, then continues through four implementation phases.", ["Requirements & Design: M1–M3 ✓", "IoT, AI, dashboard pilot, and optimization continue through M9", "Premium BDT 2,315,816.72 · Standard BDT 1,392,986.72"]],
    11: ["12 / CONCLUSION", "BIIL proposes one view across fragmented factory operations.", "The project report defines the problem, objectives, literature context, proposed method, architecture, schedule and expected prototype.", ["The intended outcome is a working factory-monitoring prototype", "Operational visibility, quality, traceability, energy and safety are target areas", "Development and evaluation remain future work described by the plan"]],
  };
  const [eyebrow, title, subtitle, bullets] = copy[slide];
  const evidenceLabels: Record<number, string> = {
    1: "DOCUMENTED PROBLEM STATEMENT",
    2: "PROJECT OBJECTIVES",
    3: "LITERATURE REVIEW · CITED STUDIES",
    4: "RESEARCH GAP · PROPOSED BIIL RESPONSE",
    5: "PROPOSED METHODOLOGY",
    6: "PROPOSED INSPECTION FLOW",
    7: "PROPOSED FOUR-LAYER ARCHITECTURE",
    8: "PROPOSED BOM · BASELINE ESTIMATES",
    9: "EXPECTED DELIVERABLES · NOT COMPLETED CLAIMS",
    10: "NINE-MONTH PROJECT GANTT",
    11: "CONCLUSION · INTENDED OUTCOMES",
  };
  const visualLabels: Record<number, string> = {
    1: "SEVEN DOCUMENTED PROBLEMS",
    2: "OBJECTIVES GROUPED INTO FOUR AREAS",
    3: "CITED STUDIES · NOT BIIL RESULTS",
    4: "SIX PROPOSED INTELLIGENCE DOMAINS",
    5: "PROPOSED END-TO-END METHOD",
    6: "PROPOSED HYBRID INSPECTION PIPELINE",
    7: "PROPOSED FOUR-LAYER ARCHITECTURE",
    8: "CONFIGURATIONS AND BASELINE COSTS",
    9: "PLANNED OUTPUTS · PHASES 1–5",
    10: "TIMELINE · BUDGET ESTIMATES",
    11: "INTENDED OUTCOMES · NOT MEASURED RESULTS",
  };
  return <div className={`content-grid scene-${slide}`}>
    <div className="slide-copy"><SlideHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="key-points">{bullets.map((item, i) => <div className="key-point" key={item} role="group" aria-label={item}><span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p></div>)}</div>
      <div className="scope-label"><span className="scope-dot" /> {evidenceLabels[slide]}</div>
    </div>
    <div className="visual-column"><DataViz slide={slide} selectedGap={selectedGap} setSelectedGap={setSelectedGap} standard={standard} setStandard={setStandard} /><p className="visual-caption"><span>{visualLabels[slide]}</span><span>{String(slide + 1).padStart(2, "0")} / 12</span></p></div>
  </div>;
}

export default function Presentation() {
  const [slide, setSlide] = useState(0);
  const [overview, setOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notes, setNotes] = useState(false);
  const [selectedGap, setSelectedGap] = useState(0);
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
    if (root.current?.contains(document.activeElement) && document.activeElement instanceof HTMLElement) document.activeElement.blur();
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
      if (event.key === "ArrowRight" || (event.key === " " && !(target instanceof HTMLButtonElement))) { event.preventDefault(); navigate(1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
      else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (busyRef.current) return;
        if (!overview && (slideRef.current === 8 || slideRef.current === 10)) {
          const tab = root.current?.querySelector<HTMLButtonElement>(`[data-budget-tab="${event.key === "ArrowDown" ? "standard" : "premium"}"]`);
          if (tab) { tab.focus({ preventScroll: true }); tab.click(); }
          return;
        }
        const selector = overview ? ".overview-panel .overview-card" : slideRef.current === 4 ? ".slide-content .domain-explorer .orbit-node" : null;
        const controls = selector ? Array.from(root.current?.querySelectorAll<HTMLElement>(selector) ?? []).filter((element) => !element.hasAttribute("disabled")) : [];
        if (controls.length) {
          const current = controls.indexOf(document.activeElement as HTMLElement);
          const step = event.key === "ArrowDown" ? 1 : -1;
          const next = current < 0 ? (step > 0 ? 0 : controls.length - 1) : (current + step + controls.length) % controls.length;
          controls[next].focus({ preventScroll: true });
          if (controls[next].hasAttribute("data-activate-on-arrow") && controls[next] instanceof HTMLButtonElement) controls[next].click();
          controls[next].scrollIntoView({ block: "nearest", behavior: reduceMotion.current ? "auto" : "smooth" });
        }
      }
      else if (event.key === "Escape") { if (overview) setOverview(false); else if (document.fullscreenElement) void document.exitFullscreen(); }
      else if (event.key.toLowerCase() === "o") setOverview((v) => !v);
      else if (event.key.toLowerCase() === "n") setNotes((v) => !v);
      else if (event.key.toLowerCase() === "f") void enterFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("keydown", onKey);
    };
  }, [enterFullscreen, navigate, overview]);

  useEffect(() => () => { timelineRef.current?.kill(); }, []);

  return <main className={`presentation ${isFullscreen ? "fullscreen" : ""}`} ref={root}>
    <div className="world-canvas" aria-hidden="true"><Canvas fallback={<div className="webgl-fallback"><span>3D VIEW UNAVAILABLE</span><small>Presentation content and controls remain available.</small></div>} dpr={[1, 1.55]} camera={{ position: [0, 3.7, 12.6], fov: 45 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}><IndustrialWorld world={world} /></Canvas></div>
    <div className="atmosphere" aria-hidden="true" />
    <div className="topbar"><a className="brand" href="#presentation" aria-label="BIIL presentation home"><span className="brand-symbol">B<span>.</span></span><span className="brand-name">BIIL<small>INDUSTRIAL INTELLIGENCE</small></span></a><div className="top-center"><span className="status-dot" /> <span>PROJECT DEFENSE</span><i /> <span>SOUTHEAST UNIVERSITY</span></div><div className="top-actions"><span className="course-pill">FYDP-I <i /> CSE 460</span><a className="download-button" href="/BIIL_Offline_Presentation.pptx" download="BIIL_Offline_Presentation.pptx" aria-label="Download offline PowerPoint"><Download size={15} /><span>PPTX</span></a><button className="icon-button" onClick={() => setNotes((v) => !v)} aria-label="Toggle presenter notes"><CircleHelp size={17} /></button><button className="icon-button" onClick={() => setOverview(true)} aria-label="Open slide overview"><Layers3 size={17} /></button><button className="icon-button" onClick={() => void enterFullscreen()} aria-label="Toggle fullscreen">{isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}</button></div></div>
    <div className="slide-stage" id="presentation"><div className="world-vignette" /><div ref={content} className="slide-content"><AnimatePresence mode="wait"><motion.div key={slide} className="scene-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}><SlideContent slide={slide} selectedGap={selectedGap} setSelectedGap={setSelectedGap} standard={standard} setStandard={setStandard} /></motion.div></AnimatePresence></div></div>
    {notes && <aside className="presenter-note"><button onClick={() => setNotes(false)} aria-label="Close notes"><X size={15} /></button><small>PRESENTER NOTE</small><p>All BIIL functions are proposed in the FYDP-I report. The dashboard and sensor values in this presentation are illustrative demonstrations, not results from a deployed system.</p></aside>}
    <footer className="control-bar"><div className="slide-ident"><span>{String(slide + 1).padStart(2, "0")}</span><i />{chapters[slide]}</div><div className="progress-track" aria-label={`Slide ${slide + 1} of ${chapters.length}`}><div className="progress-fill" style={{ width: `${((slide + 1) / chapters.length) * 100}%` }} />{chapters.map((name, i) => <button key={name} style={{ left: `${(i / (chapters.length - 1)) * 100}%` }} className={`progress-mark ${i === slide ? "active" : ""}`} onClick={() => startTransition(i)} aria-label={`Go to slide ${i + 1}: ${name}`} />)}</div><div className="nav-controls"><button className="nav-button" onClick={() => navigate(-1)} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft size={16} /></button><span>{String(slide + 1).padStart(2, "0")}<i>/</i>12</span><button className="nav-button next" onClick={() => navigate(1)} disabled={slide === 11} aria-label="Next slide"><ArrowRight size={16} /></button></div></footer>
    <div className="keyboard-hint"><span>←</span><span>→</span> SLIDES {overview ? <><i /><span>↑</span><span>↓</span> CHOOSE · ENTER OPEN</> : slide === 4 ? <><i /><span>↑</span><span>↓</span> SELECT DOMAIN</> : null}<i /> O OVERVIEW <i /> F FULLSCREEN</div>
    {overview && <div className="overview-backdrop" role="dialog" aria-modal="true" aria-label="Slide overview" onClick={(e) => { if (e.target === e.currentTarget) setOverview(false); }}><div className="overview-panel"><div className="overview-heading"><div><small>PRESENTATION MAP</small><h2>All scenes</h2></div><button className="icon-button" onClick={() => setOverview(false)} aria-label="Close overview"><X size={18} /></button></div><div className="overview-grid">{chapters.map((name, i) => <button className={`overview-card ${slide === i ? "current" : ""}`} key={name} onClick={() => { setOverview(false); startTransition(i); }}><span>{String(i + 1).padStart(2, "0")}</span><strong>{name}</strong><ArrowRight size={14} /></button>)}</div></div></div>}
  </main>;
}
