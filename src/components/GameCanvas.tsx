import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { KeyBindings, MaskOption } from '../types';
import { soundEngine } from './SoundEngine';
import { Heart, Trophy, Sparkles, Volume2, VolumeX, ArrowLeft, RotateCcw, AlertCircle, Play } from 'lucide-react';

interface GameCanvasProps {
  bindings: KeyBindings;
  onExit: () => void;
}

const MASK_OPTIONS: MaskOption[] = [
  {
    id: 'lek',
    name: 'Phi Ta Khon Lek',
    nameTh: 'หน้ากากผีตาโขนเล็ก (Agile)',
    color: '#ef4444', // Red
    glow: 'rgba(239, 68, 68, 0.5)',
    skill: 'Fire Talisman',
    skillTh: 'ยันต์ไฟพะเนียงทอง',
    descriptionTh: 'หน้ากากจอมขมังเวทย์ มีความเร็วสูง ฟันดาบและเคลื่อนที่ได้คล่องแคล่วว่องไวที่สุด',
    descriptionEn: 'High agility. Fast movement and rapid strikes.',
    statSpeed: 5,
    statJump: 3,
    statAttack: 3,
  },
  {
    id: 'yai',
    name: 'Phi Ta Khon Yai',
    nameTh: 'หน้ากากผีตาโขนใหญ่ (Brute)',
    color: '#10b981', // Emerald Green
    glow: 'rgba(16, 185, 129, 0.5)',
    skill: 'Forest Quake',
    skillTh: 'คลื่นป่าพยัคฆ์คำราม',
    descriptionTh: 'หน้ากากยักษ์โบราณที่เปี่ยมไปด้วยพลังทำลายล้างสูง ฟันสกัดคู่ต่อสู้ได้กว้างขวาง',
    descriptionEn: 'Ancient giant mask. High impact range and durable stance.',
    statSpeed: 3.5,
    statJump: 3.5,
    statAttack: 5,
  },
  {
    id: 'kuan',
    name: 'Chao Pho Kuan',
    nameTh: 'หน้ากากเจ้าพ่อกวน (Divine)',
    color: '#f59e0b', // Amber
    glow: 'rgba(245, 158, 11, 0.5)',
    skill: 'Divine Blessing',
    skillTh: 'รัศมีกวนพิทักษ์ภัย',
    descriptionTh: 'หน้ากากพิธีกรรมศักดิ์สิทธิ์ สามารถกระโดดได้สูงลอยฟ้า และสร้างออร่าเต้นปัดเป่าภัยพิบัติสะดวกรวดเร็ว',
    descriptionEn: 'Sacred leader mask. Incredible jump height and high-radius pacifying aura.',
    statSpeed: 4,
    statJump: 5,
    statAttack: 4,
  }
];

// 3D Particles Container Component
interface Particle3D {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

// 3D Flowers Collection Component
interface FlowerData {
  id: number;
  position: THREE.Vector3;
  phase: number;
  collected: boolean;
}

// 3D Enemy Spirits Component
interface EnemyData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: 'roam' | 'chase' | 'stunned' | 'dance' | 'dead';
  stunTimer: number;
  danceTimer: number;
  speed: number;
  phase: number;
  color: string;
  hp: number;
  hitFlashTimer: number;
  isFacingLeft: boolean;
  deathTimer: number;
  knockbackVel: THREE.Vector3;
}

// 3D Boss Component
interface BossData {
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  state: 'idle' | 'charging_near' | 'charging_far' | 'warning_shoot' | 'shooting' | 'dead';
  hitFlashTimer: number;
  actionTimer: number;
  shootTimer: number;
  isFacingLeft: boolean;
  targetPos?: THREE.Vector3;
}

// 3D Boss Bullet Component
interface BossBulletData {
  id: number;
  position: THREE.Vector3;
  targetPos: THREE.Vector3;
  phase: 'rising' | 'falling' | 'exploded';
  timer: number;
  speed: number;
}

// 3D Power-up Item Component
interface ItemData {
  id: number;
  position: THREE.Vector3;
  collected: boolean;
  phase: number;
}

// Central 3D Pagoda (Phra That Si Song Rak)
function CentralPagoda() {
  return (
    <group position={[0, 0, 0]}>
      {/* Pagoda Square Multi-Tiered Base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.8, 5]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.6, 4]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.6, 3]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.8} />
      </mesh>

      {/* Tapered middle spire body */}
      <mesh position={[0, 2.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.5, 1.4, 4]} />
        <meshStandardMaterial color="#f9fafb" roughness={0.6} />
      </mesh>

      {/* Main Golden Peak Cone */}
      <mesh position={[0, 4.4, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.1, 2.0, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Golden Tip Needle */}
      <mesh position={[0, 5.7, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Small Red & White decorative shrine boxes at corners */}
      <mesh position={[2, 0.9, 2]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-2, 0.9, 2]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[2, 0.9, -2]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-2, 0.9, -2]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

// Beautiful scattered trees
interface TreeProps {
  position: [number, number, number];
}
function DecoTree({ position }: TreeProps) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 3.0, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Layer 1 Leaves */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[1.5, 1.8, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} flatShading />
      </mesh>
      {/* Layer 2 Leaves */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <coneGeometry args={[1.1, 1.4, 6]} />
        <meshStandardMaterial color="#166534" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

// Glowing Lantern Posts
interface LanternProps {
  position: [number, number, number];
}
function DecoLantern({ position }: LanternProps) {
  return (
    <group position={position}>
      {/* Wooden Post */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 2.5, 8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* Lantern Housing */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#d97706" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Glowing core */}
      <mesh position={[0, 2.6, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Soft local pointlight casting warm night glow */}
      <pointLight position={[0, 2.6, 0]} color="#fbbf24" intensity={1.5} distance={10} decay={1.5} castShadow />
    </group>
  );
}

// Arena outer stone fences
function BoundaryWalls() {
  return (
    <group>
      {/* North Wall */}
      <mesh position={[0, 0.4, -25.2]} receiveShadow castShadow>
        <boxGeometry args={[50.8, 0.8, 0.4]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 0.4, 25.2]} receiveShadow castShadow>
        <boxGeometry args={[50.8, 0.8, 0.4]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-25.2, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.4, 0.8, 50.8]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>
      {/* East Wall */}
      <mesh position={[25.2, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.4, 0.8, 50.8]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>

      {/* Decorative corner shrines */}
      <mesh position={[-25, 0.8, -25]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[25, 0.8, -25]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-25, 0.8, 25]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[25, 0.8, 25]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

// Optimized Sprite Components for Enemy & Boss
interface EnemySpriteProps {
  enemy: EnemyData;
  texture: THREE.Texture;
}

function EnemySprite({ enemy, texture }: EnemySpriteProps) {
  const spriteRef = useRef<THREE.Group>(null);

  const enemyTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.repeat.set(0.25, 0.5); // 4 columns, 2 rows
    return t;
  }, [texture]);

  useFrame((state) => {
    if (!spriteRef.current) return;
    
    // Billboard effect
    spriteRef.current.quaternion.copy(state.camera.quaternion);

    // Sync position
    spriteRef.current.position.copy(enemy.position);

    // If dead and dying, shrink and rotate
    if (enemy.state === 'dead') {
      const progress = Math.min(1.0, enemy.deathTimer / 0.8);
      spriteRef.current.scale.set(
        (enemy.isFacingLeft ? 2.2 : -2.2) * (1.0 - progress),
        2.2 * (1.0 - progress),
        1
      );
      spriteRef.current.rotation.z += 10.0 * state.clock.getDelta();
    } else {
      spriteRef.current.scale.set(enemy.isFacingLeft ? 2.2 : -2.2, 2.2, 1);
    }

    // Animate sprite frames (4 frames per row)
    const animFrame = Math.floor(state.clock.getElapsedTime() * 6) % 4;
    const isMoving = enemy.state === 'chase' || enemy.state === 'roam';
    const rowIdx = isMoving ? 1 : 0; // Row 0 is idle/standing, Row 1 is walk

    enemyTexture.offset.x = animFrame * 0.25;
    enemyTexture.offset.y = (1 - rowIdx) * 0.5;
  });

  // Decide flash color
  let flashColor: THREE.Color | null = null;
  if (enemy.hitFlashTimer > 0) {
    if (enemy.state === 'dead') {
      flashColor = new THREE.Color('#ffffff'); // white flash when dying
    } else {
      flashColor = new THREE.Color('#ef4444'); // red flash on regular hit
    }
  }

  return (
    <group ref={spriteRef}>
      <mesh castShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={enemyTexture}
          transparent
          alphaTest={0.4}
          side={THREE.DoubleSide}
          emissive={flashColor || new THREE.Color(0, 0, 0)}
          emissiveIntensity={flashColor ? 2.5 : 0.0}
        />
      </mesh>
      
      {/* Floating health indicator if hit once */}
      {enemy.hp === 1 && enemy.state !== 'dead' && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <planeGeometry args={[0.5, 0.08]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.125, 0, 0.01]}>
            <planeGeometry args={[0.25, 0.06]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
    </group>
  );
}

interface BossSpriteProps {
  boss: BossData;
  texture: THREE.Texture;
}

function BossSprite({ boss, texture }: BossSpriteProps) {
  const spriteRef = useRef<THREE.Group>(null);

  const bossTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.repeat.set(0.5, 0.5); // 2 columns, 2 rows
    return t;
  }, [texture]);

  useFrame((state) => {
    if (!spriteRef.current) return;
    
    // Billboard
    spriteRef.current.quaternion.copy(state.camera.quaternion);

    // Sync position
    spriteRef.current.position.copy(boss.position);

    // Death animation scaling
    if (boss.state === 'dead') {
      const progress = Math.min(1.0, (2.0 - boss.actionTimer) / 2.0);
      spriteRef.current.scale.set(
        (boss.isFacingLeft ? 4.5 : -4.5) * (1.0 - progress),
        4.5 * (1.0 - progress),
        1
      );
    } else if (boss.state === 'warning_shoot') {
      // Rapid scale up/down warning pulsing step ("ก่อนโยนลูกไฟจะขยายย่อ เป็น step บอก")
      const pulse = 1.0 + Math.sin(state.clock.getElapsedTime() * 18.0) * 0.25;
      spriteRef.current.scale.set(
        (boss.isFacingLeft ? 4.5 : -4.5) * pulse,
        4.5 * pulse,
        1
      );
    } else {
      spriteRef.current.scale.set(boss.isFacingLeft ? 4.5 : -4.5, 4.5, 1);
    }

    // Anim frames: 2 frames per row, 4 fps
    const animFrame = Math.floor(state.clock.getElapsedTime() * 4) % 2;
    const rowIdx = (boss.state === 'shooting' || boss.state === 'warning_shoot') ? 1 : 0;

    bossTexture.offset.x = animFrame * 0.5;
    bossTexture.offset.y = (1 - rowIdx) * 0.5;
  });

  let flashColor: THREE.Color | null = null;
  if (boss.hitFlashTimer > 0) {
    if (boss.state === 'dead') {
      flashColor = new THREE.Color('#ffffff');
    } else {
      flashColor = new THREE.Color('#ef4444');
    }
  }

  return (
    <group ref={spriteRef}>
      <mesh castShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={bossTexture}
          transparent
          alphaTest={0.4}
          side={THREE.DoubleSide}
          emissive={flashColor || new THREE.Color(0, 0, 0)}
          emissiveIntensity={flashColor ? 3.0 : 0.0}
        />
      </mesh>
      
      {/* Large Floating Boss HP Bar above them */}
      {boss.state !== 'dead' && (
        <group position={[0, 2.5, 0]}>
          {/* Background */}
          <mesh>
            <planeGeometry args={[2.0, 0.16]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          {/* Health fill */}
          <mesh position={[((boss.hp / boss.maxHp) - 1) * 1.0, 0, 0.01]}>
            <planeGeometry args={[(boss.hp / boss.maxHp) * 2.0, 0.12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 3D Grass Mesh Component with Stepping Collision & Spring Physics
interface GrassMeshProps {
  position: THREE.Vector3;
  baseHeight: number;
  width: number;
  texture: THREE.Texture;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
}

function GrassMesh({ position, baseHeight, width, texture, playerPosRef }: GrassMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Face the camera
    groupRef.current.quaternion.copy(state.camera.quaternion);

    // Calculate distance to player on XZ plane
    const pPos = playerPosRef.current;
    const dx = pPos.x - position.x;
    const dz = pPos.z - position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Check if player is standing on it
    const isSteppedOn = dist < 1.0;
    const targetScaleY = isSteppedOn ? 0.08 : baseHeight;

    // Smooth spring back or squish transition
    const currentScaleY = groupRef.current.scale.y;
    const dt = Math.min(0.1, state.clock.getDelta());
    groupRef.current.scale.y = THREE.MathUtils.lerp(currentScaleY, targetScaleY, 15.0 * dt);
  });

  return (
    <group ref={groupRef} position={position} scale={[width, baseHeight, 1]}>
      {/* Offset the mesh by 0.5 on the Y axis so the pivot is at the bottom of the grass */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.4}
          side={THREE.DoubleSide}
          roughness={1.0}
        />
      </mesh>
    </group>
  );
}

// 3D Interactive Warp Gate Portal Component
interface WarpGateProps {
  position: THREE.Vector3;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onEnter: () => void;
}

function WarpGate({ position, playerPosRef, onEnter }: WarpGateProps) {
  const portalRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!portalRef.current) return;
    
    // Rotate portal inner energy
    portalRef.current.rotation.z += 1.8 * delta;

    // Pulse scaling effect
    const pulse = 1.0 + Math.sin(state.clock.getElapsedTime() * 4) * 0.08;
    portalRef.current.scale.set(pulse, pulse, pulse);

    // Billboarding face camera
    portalRef.current.quaternion.copy(state.camera.quaternion);

    // Calculate distance to player
    const dist = playerPosRef.current.distanceTo(position);
    if (dist < 1.3) {
      onEnter();
    }
  });

  return (
    <group position={position}>
      {/* Outer energy swirl group */}
      <group ref={portalRef}>
        {/* Outer glowing ring */}
        <mesh>
          <torusGeometry args={[1.0, 0.1, 16, 64]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Inner swirling plane */}
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0, 0.9, 32]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Point light centered on the portal */}
      <pointLight color="#38bdf8" intensity={2.5} distance={6} />
    </group>
  );
}

// 3D Animated NPC Character Sprite
interface NpcSpriteProps {
  position: THREE.Vector3;
  texture: THREE.Texture;
  isMoving: boolean;
  isFacingLeft: boolean;
}

function NpcSprite({ position, texture, isMoving, isFacingLeft }: NpcSpriteProps) {
  const spriteRef = useRef<THREE.Group>(null);

  const npcTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.repeat.set(0.25, 0.5); // 4 columns, 2 rows
    return t;
  }, [texture]);

  useFrame((state) => {
    if (!spriteRef.current) return;
    
    // Billboard effect
    spriteRef.current.quaternion.copy(state.camera.quaternion);

    // Sync position
    spriteRef.current.position.copy(position);

    // Face player
    spriteRef.current.scale.set(isFacingLeft ? 2.56 : -2.56, 2.56, 1);

    // Animate sprite frames (4 frames per row)
    const animFrame = Math.floor(state.clock.getElapsedTime() * 6) % 4;
    const rowIdx = isMoving ? 1 : 0; // Row 0 is idle, Row 1 is walking

    npcTexture.offset.x = animFrame * 0.25;
    npcTexture.offset.y = (1 - rowIdx) * 0.5;
  });

  return (
    <group ref={spriteRef}>
      <mesh castShadow>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={npcTexture}
          transparent
          alphaTest={0.4}
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

// Actual 3D Gameplay Scene
interface GameSceneProps {
  selectedMask: MaskOption;
  bindings: KeyBindings;
  controlsRef: React.MutableRefObject<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    attack: boolean;
    dance: boolean;
    jump: boolean;
  }>;
  onUpdateHP: (hp: number) => void;
  onUpdateScore: (cb: (s: number) => number) => void;
  onUpdateFlowers: (cb: (f: number) => number) => void;
  onUpdateDefeatedCount: (cb: (d: number) => number) => void;
  gameState: string;
  setGameState: (s: 'SELECT' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' | 'ENDING') => void;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  isPaused: boolean;
}

function GameScene({
  selectedMask,
  bindings,
  controlsRef,
  onUpdateHP,
  onUpdateScore,
  onUpdateFlowers,
  onUpdateDefeatedCount,
  gameState,
  setGameState,
  playerPosRef,
  isPaused,
}: GameSceneProps) {
  // Load all textures using useLoader
  const groundTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dd86koakl/image/upload/v1782440054/ground_rj20em.png');
  const playerTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dd86koakl/image/upload/v1782440053/player_mask_fvzlz7.png');
  const itemTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dd86koakl/image/upload/v1782440054/item_fwnhc1.png');
  const enemyTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dd86koakl/image/upload/v1782440052/enemy_avrsvs.png');
  const bossTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dd86koakl/image/upload/v1782440054/boss_hjxdpa.png');
  const grassTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/grass_2_kjkske.png');
  const npcTexture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png');

  // Configure textures
  useEffect(() => {
    if (groundTexture) {
      groundTexture.wrapS = THREE.RepeatWrapping;
      groundTexture.wrapT = THREE.RepeatWrapping;
      groundTexture.repeat.set(12, 12); // Tiling เล็กหน่อย
      groundTexture.minFilter = THREE.NearestFilter;
      groundTexture.magFilter = THREE.NearestFilter;
    }
    if (itemTexture) {
      itemTexture.minFilter = THREE.NearestFilter;
      itemTexture.magFilter = THREE.NearestFilter;
    }
    if (enemyTexture) {
      enemyTexture.minFilter = THREE.NearestFilter;
      enemyTexture.magFilter = THREE.NearestFilter;
    }
    if (bossTexture) {
      bossTexture.minFilter = THREE.NearestFilter;
      bossTexture.magFilter = THREE.NearestFilter;
    }
    if (grassTexture) {
      grassTexture.minFilter = THREE.NearestFilter;
      grassTexture.magFilter = THREE.NearestFilter;
    }
    if (npcTexture) {
      npcTexture.minFilter = THREE.NearestFilter;
      npcTexture.magFilter = THREE.NearestFilter;
    }
  }, [groundTexture, itemTexture, enemyTexture, bossTexture, grassTexture, npcTexture]);

  const clonedPlayerTexture = useMemo(() => {
    const t = playerTexture.clone();
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.repeat.set(0.25, 0.25);
    return t;
  }, [playerTexture]);

  // Game internal states stored in refs for maximum performance
  const playerRef = useRef<THREE.Mesh>(null);
  const playerYVel = useRef(0);
  const isGrounded = useRef(true);
  const isFacingRight = useRef(true);
  const activeAction = useRef<'idle' | 'walk' | 'attack' | 'dance'>('idle');
  
  // Timers
  const animFrame = useRef(0);
  const animTimer = useRef(0);
  const attackActive = useRef(false);
  const attackTimer = useRef(0);
  const danceActive = useRef(false);
  const invincibilityTimer = useRef(0);
  const playerHP = useRef(5);
  const internalScore = useRef(0);
  const internalFlowers = useRef(0);

  // Warp Gate and NPC Ending States
  const [warpActive, setWarpActive] = useState(false);
  const warpPos = useMemo(() => new THREE.Vector3(0, 0.8, -4), []);
  const [npcPos, setNpcPos] = useState(() => new THREE.Vector3(0, -100, 0)); // initially hidden under map
  const [isNpcMoving, setIsNpcMoving] = useState(false);
  const npcSpawned = useRef(false);

  // Expanding aura visual scaling
  const auraScale = useRef(0);

  // Trees positions
  const trees = useMemo<[number, number, number][]>(() => [
    [-8, 0, -8], [9, 0, -10], [-12, 0, 14], [14, 0, 8],
    [-18, 0, -18], [18, 0, -15], [-16, 0, -2], [15, 0, -20],
    [22, 0, 12], [-22, 0, -12], [3, 0, 21], [-4, 0, -21]
  ], []);

  // Random Grass positions and parameters
  const grasses = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => {
      // Scatter within the 50x50 ground (from -23 to 23)
      let x = (Math.random() - 0.5) * 46;
      let z = (Math.random() - 0.5) * 46;
      
      // Keep away from the pagoda base (inside [-3.5, 3.5])
      while (Math.abs(x) < 3.5 && Math.abs(z) < 3.5) {
        x = (Math.random() - 0.5) * 46;
        z = (Math.random() - 0.5) * 46;
      }

      return {
        id: i,
        position: new THREE.Vector3(x, 0.01, z), // slightly above ground to prevent Z-fighting
        baseHeight: 0.9 + Math.random() * 0.5, // 0.9 to 1.4
        width: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
      };
    });
  }, []);

  // Gold cotton flowers
  const [flowers, setFlowers] = useState<FlowerData[]>(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      // Keep away from direct pagoda center
      let x = (Math.random() - 0.5) * 44;
      let z = (Math.random() - 0.5) * 44;
      while (Math.abs(x) < 4 && Math.abs(z) < 4) {
        x = (Math.random() - 0.5) * 44;
        z = (Math.random() - 0.5) * 44;
      }
      return {
        id: i,
        position: new THREE.Vector3(x, 0.8, z),
        phase: Math.random() * Math.PI * 2,
        collected: false,
      };
    });
  });

  // Power-up items (item.png)
  const [items, setItems] = useState<ItemData[]>(() => {
    return Array.from({ length: 3 }).map((_, i) => {
      let x = (Math.random() - 0.5) * 44;
      let z = (Math.random() - 0.5) * 44;
      while (Math.abs(x) < 4 && Math.abs(z) < 4) {
        x = (Math.random() - 0.5) * 44;
        z = (Math.random() - 0.5) * 44;
      }
      return {
        id: i,
        position: new THREE.Vector3(x, 0.8, z),
        phase: Math.random() * Math.PI * 2,
        collected: false,
      };
    });
  });

  // Enemy spirits
  const [enemies, setEnemies] = useState<EnemyData[]>(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      let x = (Math.random() - 0.5) * 40;
      let z = (Math.random() - 0.5) * 40;
      while (Math.abs(x) < 5 && Math.abs(z) < 5) {
        x = (Math.random() - 0.5) * 40;
        z = (Math.random() - 0.5) * 40;
      }
      return {
        id: i,
        position: new THREE.Vector3(x, 0.6, z),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize(),
        state: 'roam',
        stunTimer: 0,
        danceTimer: 0,
        speed: 1.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        color: i % 2 === 0 ? '#f43f5e' : '#a855f7', // Rose red or Purple
        hp: 2,
        hitFlashTimer: 0,
        isFacingLeft: true,
        deathTimer: 0,
        knockbackVel: new THREE.Vector3(0, 0, 0),
      };
    });
  });

  // Boss and Bullet States
  const [boss, setBoss] = useState<BossData | null>(null);
  const [bossBullets, setBossBullets] = useState<BossBulletData[]>([]);
  const nextBulletId = useRef(0);

  // Simple 3D particle list
  const [particles, setParticles] = useState<Particle3D[]>([]);
  const nextParticleId = useRef(0);

  const spawnParticles = (pos: THREE.Vector3, color: string, count: number) => {
    const newParts: Particle3D[] = Array.from({ length: count }).map(() => {
      return {
        id: nextParticleId.current++,
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5)),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4 + 1, (Math.random() - 0.5) * 4),
        color: color,
        size: 0.12 + Math.random() * 0.12,
        life: 1.0,
        maxLife: 0.5 + Math.random() * 0.5,
      };
    });
    setParticles((prev) => [...prev, ...newParts].slice(-60)); // limit max active particles to 60 for performance
  };

  // Sound playback triggers safely inside component context
  const triggerCollectSound = () => soundEngine.playCoin();
  const triggerSlashSound = () => soundEngine.playSlash();
  const triggerDamageSound = () => soundEngine.playDamage();
  const triggerSkillSound = () => soundEngine.playSkill();

  // Primary 3D Update Loop (60fps)
  useFrame((state, delta) => {
    if ((gameState !== 'PLAYING' && gameState !== 'ENDING') || isPaused) return;

    // NPC movement logic in Ending state
    if (gameState === 'ENDING') {
      if (!npcSpawned.current) {
        npcSpawned.current = true;
        // Spawn NPC 6 units in front of player
        const spawnPos = playerPosRef.current.clone().add(new THREE.Vector3(0, -0.18, -6.0));
        setNpcPos(spawnPos);
        setIsNpcMoving(true);
      } else {
        // Walk towards player
        const targetPos = playerPosRef.current.clone().add(new THREE.Vector3(0, -0.18, -2.2));
        const dir = targetPos.clone().sub(npcPos);
        const dist = dir.length();
        if (dist > 0.05) {
          const moveStep = Math.min(dist, 1.8 * delta);
          dir.normalize().multiplyScalar(moveStep);
          setNpcPos((prev) => prev.clone().add(dir));
          setIsNpcMoving(true);
        } else {
          setIsNpcMoving(false);
        }
      }
    }

    // 1. Decrement damage flash invincibility timer
    if (invincibilityTimer.current > 0) {
      invincibilityTimer.current -= delta;
    }

    // 2. Read Keyboard Inputs and determine move vectors
    const moveDir = new THREE.Vector3(0, 0, 0);
    const keys = controlsRef.current;

    if (gameState === 'PLAYING') {
      if (keys.forward) moveDir.z -= 1;
      if (keys.backward) moveDir.z += 1;
      if (keys.left) moveDir.x -= 1;
      if (keys.right) moveDir.x += 1;
    }

    const isMoving = moveDir.lengthSq() > 0;

    // Apply 8-directional movement
    if (gameState === 'PLAYING' && isMoving) {
      moveDir.normalize();
      
      // Speed stats factored (lek is fastest, yai is slower)
      const currentSpeed = selectedMask.id === 'lek' ? 6.5 : selectedMask.id === 'yai' ? 4.2 : 5.0;
      playerPosRef.current.addScaledVector(moveDir, currentSpeed * delta);

      // Clamp position within boundary walls
      playerPosRef.current.x = THREE.MathUtils.clamp(playerPosRef.current.x, -24.3, 24.3);
      playerPosRef.current.z = THREE.MathUtils.clamp(playerPosRef.current.z, -24.3, 24.3);

      // Cancel dancing mode on movement
      if (danceActive.current) {
        danceActive.current = false;
      }

      // Flip sprite texture scale horizontally depending on X movement
      if (moveDir.x < 0) {
        isFacingRight.current = false;
      } else if (moveDir.x > 0) {
        isFacingRight.current = true;
      }
    }

    // Handle jumping and gravity physics
    if (gameState === 'PLAYING' && keys.jump && isGrounded.current) {
      const jumpVel = selectedMask.id === 'kuan' ? 12.0 : 8.8; // Chao Pho Kuan jumps extremely high
      playerYVel.current = jumpVel;
      isGrounded.current = false;
      soundEngine.playJump();

      // Emit jump ground particles
      spawnParticles(playerPosRef.current, '#9ca3af', 8);
    }

    if (!isGrounded.current) {
      // Gravity acceleration
      playerYVel.current += -22.0 * delta;
      playerPosRef.current.y += playerYVel.current * delta;

      // Check ground collision
      if (playerPosRef.current.y <= 1.28) {
        playerPosRef.current.y = 1.28;
        playerYVel.current = 0;
        isGrounded.current = true;
      }
    }

    // 3. Handle Attack state (P key)
    if (gameState === 'PLAYING' && keys.attack && !attackActive.current) {
      attackActive.current = true;
      attackTimer.current = 0.4; // 400ms duration
      danceActive.current = false; // Cancel dance
      triggerSlashSound();

      // Spawn sword slash sparks
      const slashPos = playerPosRef.current.clone();
      slashPos.x += isFacingRight.current ? 1.0 : -1.0;
      spawnParticles(slashPos, selectedMask.color, 12);
    }

    if (attackActive.current) {
      attackTimer.current -= delta;
      if (attackTimer.current <= 0) {
        attackActive.current = false;
      }
    }

    // 4. Handle Dance Skill state (O key)
    if (gameState === 'PLAYING' && keys.dance && !danceActive.current && !attackActive.current) {
      danceActive.current = true;
      triggerSkillSound();
    }

    // Determine current action for correct animation row
    if (attackActive.current) {
      activeAction.current = 'attack';
    } else if (danceActive.current) {
      activeAction.current = 'dance';
    } else if (isMoving) {
      activeAction.current = 'walk';
    } else {
      activeAction.current = 'idle';
    }

    // 5. Update animation frame updates over time
    animTimer.current += delta;
    const currentFrameRate = activeAction.current === 'attack' ? 0.08 : 0.12; // attacks are faster
    if (animTimer.current >= currentFrameRate) {
      animTimer.current = 0;
      animFrame.current = (animFrame.current + 1) % 4;
    }

    // Apply texture offsets corresponding to action rows
    let rowIdx = 0;
    switch (activeAction.current) {
      case 'idle': rowIdx = 0; break;
      case 'walk': rowIdx = 1; break;
      case 'attack': rowIdx = 2; break;
      case 'dance': rowIdx = 3; break;
    }

    clonedPlayerTexture.offset.x = animFrame.current * 0.25;
    clonedPlayerTexture.offset.y = (3 - rowIdx) * 0.25;

    // Apply horizontal texture mirroring safely via mesh scaling X
    if (playerRef.current) {
      playerRef.current.position.copy(playerPosRef.current);
      // Billboard: align sprite perfectly screen-aligned to follow camera view
      playerRef.current.quaternion.copy(state.camera.quaternion);

      // Set scale. Negative X flips the sprite
      playerRef.current.scale.set(isFacingRight.current ? 2.56 : -2.56, 2.56, 1);
    }

    // Smoothly animate expanding golden protective aura
    if (danceActive.current) {
      // expand radius to maximum
      const maxAuraRad = selectedMask.id === 'kuan' ? 5.2 : 3.8;
      auraScale.current = THREE.MathUtils.lerp(auraScale.current, maxAuraRad, 0.08);

      // Emit soft glowing stars/hearts rising up around player
      if (Math.random() < 0.15) {
        const sparkPos = playerPosRef.current.clone();
        sparkPos.x += (Math.random() - 0.5) * auraScale.current;
        sparkPos.z += (Math.random() - 0.5) * auraScale.current;
        sparkPos.y = 0.1;
        spawnParticles(sparkPos, '#fef08a', 2);
      }
    } else {
      auraScale.current = THREE.MathUtils.lerp(auraScale.current, 0, 0.15);
    }

    // 6. Camera smooth follow logic
    const camOffset = new THREE.Vector3(0, 5.5, 9.5); // Camera elevated slightly and behind character
    const targetCamPosition = playerPosRef.current.clone().add(camOffset);
    state.camera.position.lerp(targetCamPosition, 0.08); // Smooth camera interpolation
    
    // Smooth look-at tracking slightly ahead of player for comfortable visibility
    const lookTarget = playerPosRef.current.clone().add(new THREE.Vector3(0, 0.5, -0.5));
    state.camera.lookAt(lookTarget);

    // 7. Process floating gold cotton flowers collection
    flowers.forEach((flower) => {
      if (flower.collected) return;

      // Float bobbing effect
      flower.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 2.5 + flower.phase) * 0.12;

      // 2D distance check
      const dx = playerPosRef.current.x - flower.position.x;
      const dz = playerPosRef.current.z - flower.position.z;
      const distSq = dx*dx + dz*dz;

      if (distSq < 1.44) { // within 1.2 units radius
        flower.collected = true;
        triggerCollectSound();

        // Increment goals and scores
        internalFlowers.current += 1;
        internalScore.current += 100;
        onUpdateFlowers(() => internalFlowers.current);
        onUpdateScore(() => internalScore.current);

        // Burst gold stars
        spawnParticles(flower.position, '#fbbf24', 18);

        // Check victory condition
        if (internalFlowers.current >= 15) {
          setGameState('VICTORY');
        }

        // Respawn elsewhere in 4 seconds
        setTimeout(() => {
          let rx = (Math.random() - 0.5) * 44;
          let rz = (Math.random() - 0.5) * 44;
          while (Math.abs(rx) < 4 && Math.abs(rz) < 4) {
            rx = (Math.random() - 0.5) * 44;
            rz = (Math.random() - 0.5) * 44;
          }
          flower.position.set(rx, 0.9, rz);
          flower.collected = false;
        }, 4000);
      }
    });

    // 7.5. Process power-up items collection (restore energy/HP)
    items.forEach((item) => {
      if (item.collected) return;

      // Float bobbing effect
      item.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 3.0 + item.phase) * 0.12;

      // 2D distance check
      const dx = playerPosRef.current.x - item.position.x;
      const dz = playerPosRef.current.z - item.position.z;
      const distSq = dx*dx + dz*dz;

      if (distSq < 1.44) { // within 1.2 units radius
        item.collected = true;
        triggerCollectSound();

        // Restore health/power (max 5)
        if (playerHP.current < 5) {
          playerHP.current += 1;
          onUpdateHP(playerHP.current);
        }

        // Increment score
        internalScore.current += 50;
        onUpdateScore(() => internalScore.current);

        // Burst green healing particles
        spawnParticles(item.position, '#22c55e', 20);

        // Respawn elsewhere in 8 seconds
        setTimeout(() => {
          let rx = (Math.random() - 0.5) * 44;
          let rz = (Math.random() - 0.5) * 44;
          while (Math.abs(rx) < 4 && Math.abs(rz) < 4) {
            rx = (Math.random() - 0.5) * 44;
            rz = (Math.random() - 0.5) * 44;
          }
          item.position.set(rx, 0.8, rz);
          item.collected = false;
        }, 8000);
      }
    });

    // 8. Process Wandering Enemies behavior & collision
    const updatedEnemies = enemies.map((enemy) => {
      // Decrement flash timer
      let hitFlashT = enemy.hitFlashTimer > 0 ? enemy.hitFlashTimer - delta : 0;
      let stunT = enemy.stunTimer > 0 ? enemy.stunTimer - delta : 0;
      let danceT = enemy.danceTimer > 0 ? enemy.danceTimer - delta : 0;
      let enemyHp = enemy.hp;
      let enemyDeathT = enemy.deathTimer;
      let currentState = enemy.state;
      let isFacingLeft = enemy.isFacingLeft;
      let eKnockback = enemy.knockbackVel.clone();

      if (currentState === 'dead') {
        enemyDeathT += delta;
        // Dead enemy flies away fast
        enemy.position.addScaledVector(eKnockback, delta);
      } else if (stunT > 0) {
        currentState = 'stunned';
        // Apply knockback slide
        enemy.position.addScaledVector(eKnockback, delta);
        eKnockback.multiplyScalar(0.9); // Friction
      } else if (danceT > 0) {
        currentState = 'dance';
      } else {
        // AI: Check distance to player
        const dx = playerPosRef.current.x - enemy.position.x;
        const dz = playerPosRef.current.z - enemy.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < 8.0) {
          currentState = 'chase';
        } else {
          currentState = 'roam';
        }
      }

      // Movement behavior
      if (currentState === 'roam') {
        // Slow random walk
        enemy.position.addScaledVector(enemy.velocity, enemy.speed * 0.5 * delta);
        
        // Face moving direction
        if (enemy.velocity.x < 0) {
          isFacingLeft = true;
        } else if (enemy.velocity.x > 0) {
          isFacingLeft = false;
        }

        // Randomly change directions occasionally
        if (Math.random() < 0.02) {
          enemy.velocity.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize();
        }
      } else if (currentState === 'chase') {
        // Walk directly towards player
        const chaseDir = playerPosRef.current.clone().sub(enemy.position);
        chaseDir.y = 0;
        chaseDir.normalize();
        enemy.position.addScaledVector(chaseDir, enemy.speed * delta);

        // Face player
        if (chaseDir.x < 0) {
          isFacingLeft = true;
        } else if (chaseDir.x > 0) {
          isFacingLeft = false;
        }
      } else if (currentState === 'dance') {
        // Jump happily in place
        enemy.position.y = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 6.0 + enemy.phase)) * 0.5;
      } else if (currentState === 'stunned') {
        // Knockback or stay still
        enemy.position.y = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 12.0)) * 0.2;
      }

      // Constrain inside bounds
      enemy.position.x = THREE.MathUtils.clamp(enemy.position.x, -24.0, 24.0);
      enemy.position.z = THREE.MathUtils.clamp(enemy.position.z, -24.0, 24.0);

      // COLLISION CHECKS WITH PLAYER
      const dx = playerPosRef.current.x - enemy.position.x;
      const dz = playerPosRef.current.z - enemy.position.z;
      const dist = Math.sqrt(dx*dx + dz*dz);

      // A. Check if enemy is swept by player active sword attack range
      if (activeAction.current === 'attack' && dist < 2.2 && currentState !== 'stunned' && currentState !== 'dance' && currentState !== 'dead') {
        enemyHp -= 1;
        hitFlashT = 0.5;

        if (enemyHp <= 0) {
          // Hit 2: Flies out of the screen or white flash and vanish
          currentState = 'dead';
          enemyDeathT = 0;

          // Fly up and away backwards from the player
          const flyDir = enemy.position.clone().sub(playerPosRef.current).normalize();
          flyDir.y = 2.0; // Fly upwards
          flyDir.normalize();
          eKnockback.copy(flyDir).multiplyScalar(16.0);

          triggerSlashSound();
          spawnParticles(enemy.position, '#ffffff', 25); // White flash particles

          // Add heavy hit score bonus
          internalScore.current += 300;
          onUpdateScore(() => internalScore.current);

          // Increment defeated count and spawn boss if reaches 10
          onUpdateDefeatedCount((currentCount) => {
            const nextCount = currentCount + 1;
            if (nextCount >= 10 && !boss) {
              setBoss({
                position: new THREE.Vector3(0, 4.5, -15),
                hp: 15,
                maxHp: 15,
                state: 'idle',
                hitFlashTimer: 0.2,
                actionTimer: 2.0,
                shootTimer: 0,
                isFacingLeft: true,
              });
            }
            return nextCount;
          });
        } else {
          // Hit 1: Knock back backward in the direction they were moving
          // "ครั้งแรกให้กระเด็นไปข้างหลังทิศทางที่เดินมา"
          stunT = 1.0;
          currentState = 'stunned';

          // Reverse velocity direction for knockback
          const moveBackDir = enemy.velocity.clone().negate().normalize();
          if (moveBackDir.lengthSq() === 0) {
            moveBackDir.copy(enemy.position).sub(playerPosRef.current).normalize();
          }
          moveBackDir.y = 0.3; // Small vertical bounce
          moveBackDir.normalize();

          // Set instant slide knockback velocity
          eKnockback.copy(moveBackDir).multiplyScalar(10.0);

          triggerSlashSound();
          spawnParticles(enemy.position, '#ef4444', 15);

          // Add hit score bonus
          internalScore.current += 150;
          onUpdateScore(() => internalScore.current);
        }
      }
      
      // B. Check if enemy is pacified by player protective dance aura
      else if (activeAction.current === 'dance' && dist <= auraScale.current && currentState !== 'dance' && currentState !== 'stunned' && currentState !== 'dead') {
        // Pacify spirit! Make them dance happily
        danceT = 5.0;
        currentState = 'dance';
        triggerCollectSound();
        spawnParticles(enemy.position, '#ec4899', 12); // Pink sparkle burst

        // Reward pacification score
        internalScore.current += 150;
        onUpdateScore(() => internalScore.current);
      }

      // C. General contact collision damaging the player (with red flash)
      else if (dist < 1.35 && currentState !== 'stunned' && currentState !== 'dance' && currentState !== 'dead') {
        // Make the enemy flash red when attacking the player
        hitFlashT = 0.4;
        
        if (invincibilityTimer.current <= 0) {
          playerHP.current -= 1;
          onUpdateHP(playerHP.current);
          invincibilityTimer.current = 1.5; // 1.5s immune frame

          triggerDamageSound();
          spawnParticles(playerPosRef.current, '#ef4444', 20);

          // Knockback player slightly
          const kDir = playerPosRef.current.clone().sub(enemy.position).normalize();
          playerPosRef.current.addScaledVector(kDir, 1.2);

          if (playerHP.current <= 0) {
            setGameState('GAMEOVER');
          }
        }
      }

      return {
        ...enemy,
        stunTimer: stunT,
        danceTimer: danceT,
        state: currentState,
        hp: enemyHp,
        hitFlashTimer: hitFlashT,
        isFacingLeft,
        deathTimer: enemyDeathT,
        knockbackVel: eKnockback,
      };
    });

    // Respawn dead enemies after 0.8s
    const processedEnemies = updatedEnemies.map((enemy) => {
      if (enemy.state === 'dead' && enemy.deathTimer >= 0.8) {
        let rx = (Math.random() - 0.5) * 40;
        let rz = (Math.random() - 0.5) * 40;
        while (Math.abs(rx) < 5 && Math.abs(rz) < 5) {
          rx = (Math.random() - 0.5) * 40;
          rz = (Math.random() - 0.5) * 40;
        }
        return {
          ...enemy,
          position: new THREE.Vector3(rx, 0.6, rz),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize(),
          state: 'roam' as const,
          stunTimer: 0,
          danceTimer: 0,
          speed: 1.5 + Math.random() * 1.5,
          color: Math.random() < 0.5 ? '#f43f5e' : '#a855f7',
          hp: 2,
          hitFlashTimer: 0,
          isFacingLeft: true,
          deathTimer: 0,
          knockbackVel: new THREE.Vector3(0, 0, 0),
        };
      }
      return enemy;
    });

    setEnemies(processedEnemies);

    // 8.5. Process Boss and Falling Bullets Behavior
    if (boss) {
      const b = { ...boss };
      b.hitFlashTimer = Math.max(0, b.hitFlashTimer - delta);

      if (b.state === 'dead') {
        b.actionTimer -= delta;
        // Fly up/shrink
        b.position.y += 10.0 * delta;
        if (b.actionTimer <= 0) {
          setWarpActive(true);
          setBoss(null); // Clear boss so the Warp Gate appears
        } else {
          setBoss(b);
        }
      } else {
        // Face player (2D sprite billboard faces the player direction)
        b.isFacingLeft = playerPosRef.current.x < b.position.x;

        // State-specific movement pattern logic
        if (b.state === 'idle') {
          // Bob up and down gently
          const bobY = Math.sin(state.clock.getElapsedTime() * 3.0) * 0.15;
          b.position.y = THREE.MathUtils.lerp(b.position.y, 4.5 + bobY, 2.0 * delta);
          // Gently return to near arena center
          b.position.x = THREE.MathUtils.lerp(b.position.x, 0, 0.5 * delta);
          b.position.z = THREE.MathUtils.lerp(b.position.z, 0, 0.5 * delta);
        } else if (b.state === 'charging_near' || b.state === 'charging_far') {
          // Dash/charge towards chosen target position very quickly
          if (b.targetPos) {
            b.position.lerp(b.targetPos, 6.0 * delta);
          }
        } else if (b.state === 'warning_shoot') {
          // Stay floating in warning pulse phase
          const bobY = Math.sin(state.clock.getElapsedTime() * 6.0) * 0.08;
          b.position.y = THREE.MathUtils.lerp(b.position.y, 4.8 + bobY, 3.0 * delta);
        } else if (b.state === 'shooting') {
          // Gently hover during shooting phase
          const bobY = Math.sin(state.clock.getElapsedTime() * 2.0) * 0.1;
          b.position.y = THREE.MathUtils.lerp(b.position.y, 4.5 + bobY, 1.5 * delta);
        }

        // Timer-based transitions
        b.actionTimer -= delta;
        if (b.actionTimer <= 0) {
          if (b.state === 'idle') {
            // Pick charging close as next step
            const angle = Math.random() * Math.PI * 2;
            const distance = 3.5 + Math.random() * 2.0; // Close range
            const target = playerPosRef.current.clone().add(new THREE.Vector3(
              Math.cos(angle) * distance,
              2.0,
              Math.sin(angle) * distance
            ));
            target.x = THREE.MathUtils.clamp(target.x, -20, 20);
            target.z = THREE.MathUtils.clamp(target.z, -20, 20);
            target.y = 3.2;

            b.state = 'charging_near';
            b.targetPos = target;
            b.actionTimer = 1.4; // 1.4s to dash close
          } else if (b.state === 'charging_near') {
            // Next, dash away to safety (charging far)
            const angle = Math.random() * Math.PI * 2;
            const distance = 12.0 + Math.random() * 4.0; // Far range
            const target = playerPosRef.current.clone().add(new THREE.Vector3(
              Math.cos(angle) * distance,
              3.5,
              Math.sin(angle) * distance
            ));
            target.x = THREE.MathUtils.clamp(target.x, -22, 22);
            target.z = THREE.MathUtils.clamp(target.z, -22, 22);
            target.y = 5.2;

            b.state = 'charging_far';
            b.targetPos = target;
            b.actionTimer = 1.4; // 1.4s to dash far
          } else if (b.state === 'charging_far') {
            // Next, initiate warning scale step ("ก่อนโยนลูกไฟจะขยายย่อ เป็น step บอก")
            b.state = 'warning_shoot';
            b.actionTimer = 1.5; // 1.5 seconds of fast scaling pulsation
          } else if (b.state === 'warning_shoot') {
            // Shoot fireball phase begins
            b.state = 'shooting';
            b.actionTimer = 3.6; // Shoot for 3.6 seconds
            b.shootTimer = 0.1;  // Fire first bullet immediately
          } else if (b.state === 'shooting') {
            // Back to idle
            b.state = 'idle';
            b.actionTimer = 2.0;
          }
        }

        // Handle Fireball launch during shooting phase
        if (b.state === 'shooting') {
          b.shootTimer -= delta;
          if (b.shootTimer <= 0) {
            b.shootTimer = 0.6; // Launch fireball every 0.6 seconds (approx 6 balls)
            
            // Spawn bullet targeted around player's footprint
            const targetPos = playerPosRef.current.clone();
            targetPos.x += (Math.random() - 0.5) * 4.0;
            targetPos.z += (Math.random() - 0.5) * 4.0;
            targetPos.y = 0.8;

            const newBullet: BossBulletData = {
              id: nextBulletId.current++,
              position: b.position.clone(),
              targetPos: targetPos,
              phase: 'rising',
              timer: 1.6, // 1.6s warning time for player to dodge
              speed: 15.0,
            };

            setBossBullets((prev) => [...prev, newBullet]);
            soundEngine.playSkill();
            spawnParticles(b.position, '#f97316', 10); // fiery orange launch particles
          }
        }

        // Player jumping sword attack collision on Boss
        const distToPlayer3D = playerPosRef.current.distanceTo(b.position);
        if (activeAction.current === 'attack' && distToPlayer3D < 3.2 && b.hitFlashTimer <= 0) {
          b.hp -= 1;
          b.hitFlashTimer = 0.4;

          triggerSlashSound();
          spawnParticles(b.position, '#facc15', 35); // Golden sparkle splash on hit

          internalScore.current += 500;
          onUpdateScore(() => internalScore.current);

          if (b.hp <= 0) {
            b.state = 'dead';
            b.actionTimer = 2.0; // Stays active for 2 seconds for death shrink/fly away
            soundEngine.playCoin();
          }
        }

        setBoss(b);
      }
    }

    // Process Boss bullets
    if (bossBullets.length > 0) {
      const updatedBullets = bossBullets
        .map((bullet) => {
          const b = { ...bullet };
          if (b.phase === 'rising') {
            b.position.y += b.speed * delta;
            if (b.position.y >= 16.0) {
              b.phase = 'falling';
              b.position.x = b.targetPos.x;
              b.position.z = b.targetPos.z;
            }
          } else if (b.phase === 'falling') {
            b.timer -= delta;
            if (b.timer <= 0) {
              b.position.y -= b.speed * delta * 1.5;
              if (b.position.y <= 0.8) {
                b.phase = 'exploded';

                // Explode
                soundEngine.playDamage();
                spawnParticles(b.targetPos, '#f97316', 20);

                // Collision with player
                const pDist2D = playerPosRef.current.clone().setY(0.8).distanceTo(b.targetPos);
                if (pDist2D < 1.8) {
                  if (invincibilityTimer.current <= 0) {
                    playerHP.current -= 1;
                    onUpdateHP(playerHP.current);
                    invincibilityTimer.current = 1.5;

                    triggerDamageSound();
                    spawnParticles(playerPosRef.current, '#ef4444', 25);

                    if (playerHP.current <= 0) {
                      setGameState('GAMEOVER');
                    }
                  }
                }
              }
            }
          }
          return b;
        })
        .filter((bullet) => bullet.phase !== 'exploded');

      setBossBullets(updatedBullets);
    }

    // 9. Update active particles and fade them out
    setParticles((prev) =>
      prev
        .map((p) => {
          const nextPos = p.position.clone().addScaledVector(p.velocity, delta);
          // Simple gravity physics on particle
          p.velocity.y -= 9.8 * delta;
          return {
            ...p,
            position: nextPos,
            life: p.life - delta / p.maxLife,
          };
        })
        .filter((p) => p.life > 0)
    );
  });

  return (
    <group>
      {/* Dynamic expanding golden mandala rings on ground when dancing */}
      {auraScale.current > 0 && (
        <mesh position={[playerPosRef.current.x, 0.05, playerPosRef.current.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, auraScale.current, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.16} side={THREE.DoubleSide} />
        </mesh>
      )}
      {auraScale.current > 0 && (
        <mesh position={[playerPosRef.current.x, 0.06, playerPosRef.current.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(0, auraScale.current - 0.1), auraScale.current, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Sword slashing crescent arc visual when attacking */}
      {attackActive.current && (
        <mesh
          position={[
            playerPosRef.current.x + (isFacingRight.current ? 1.0 : -1.0),
            playerPosRef.current.y,
            playerPosRef.current.z + 0.1
          ]}
          rotation={[0, 0, isFacingRight.current ? 0 : Math.PI]}
        >
          <ringGeometry args={[0.4, 0.9, 16, 1, 0, Math.PI]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Main Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial map={groundTexture} roughness={1.0} />
      </mesh>

      {/* Outer arena boundaries */}
      <BoundaryWalls />

      {/* Central Pagoda Landmark */}
      <CentralPagoda />

      {/* Scattered deco trees */}
      {trees.map((pos, idx) => (
        <DecoTree key={idx} position={pos} />
      ))}

      {/* Scattered Interactive Grasses */}
      {grasses.map((grass) => (
        <GrassMesh
          key={grass.id}
          position={grass.position}
          baseHeight={grass.baseHeight}
          width={grass.width}
          texture={grassTexture}
          playerPosRef={playerPosRef}
        />
      ))}

      {/* Glowing Torches */}
      <DecoLantern position={[-16, 0, -16]} />
      <DecoLantern position={[16, 0, -16]} />
      <DecoLantern position={[-16, 0, 16]} />
      <DecoLantern position={[16, 0, 16]} />

      {/* Gold cotton flowers meshes */}
      {flowers.map((f) => {
        if (f.collected) return null;
        return (
          <group key={f.id} position={f.position}>
            {/* Center golden seed puff */}
            <mesh castShadow>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Cotton flower puffs surrounding the center seed */}
            <mesh position={[0.12, 0, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color="#f9fafb" roughness={0.8} />
            </mesh>
            <mesh position={[-0.12, 0, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color="#f9fafb" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color="#f9fafb" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color="#f9fafb" roughness={0.8} />
            </mesh>

            {/* Glowing gold halo light */}
            <pointLight color="#f59e0b" intensity={0.4} distance={2.0} />
          </group>
        );
      })}

      {/* Power-up items (item.png) meshes */}
      {items.map((item) => {
        if (item.collected) return null;
        return (
          <group key={item.id} position={item.position}>
            {/* 2D Billboard sprite for item */}
            <sprite scale={[1.2, 1.2, 1.2]}>
              <spriteMaterial attach="material" map={itemTexture} transparent alphaTest={0.4} />
            </sprite>
            {/* Soft glowing pointlight */}
            <pointLight color="#22c55e" intensity={0.6} distance={2.5} />
          </group>
        );
      })}

      {/* Wandering Enemy sprites */}
      {enemies.map((e) => (
        <EnemySprite
          key={e.id}
          enemy={e}
          texture={enemyTexture}
        />
      ))}

      {/* Flying Boss sprite and health bar */}
      {boss && (
        <BossSprite
          boss={boss}
          texture={bossTexture}
        />
      )}

      {/* Boss Bullets Warning Circles and Falling Projectiles */}
      {bossBullets.map((bullet) => {
        if (bullet.phase === 'falling') {
          // Warning circle radius increases as warning timer goes down
          const warningScale = THREE.MathUtils.clamp((1.5 - bullet.timer) / 1.5, 0.1, 1.0) * 1.8;
          return (
            <group key={bullet.id}>
              {/* Red warning ring on ground */}
              <mesh position={[bullet.targetPos.x, 0.08, bullet.targetPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[warningScale - 0.1, warningScale, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.8} side={THREE.DoubleSide} />
              </mesh>
              {/* Warning filled circle */}
              <mesh position={[bullet.targetPos.x, 0.07, bullet.targetPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[warningScale, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.15} side={THREE.DoubleSide} />
              </mesh>
              
              {/* The actual falling bullet (glowing orange orb) */}
              {bullet.timer <= 0 && (
                <mesh position={bullet.position}>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshBasicMaterial color="#f97316" />
                  <pointLight color="#f97316" intensity={1.2} distance={4} />
                </mesh>
              )}
            </group>
          );
        }
        
        // Bullet rising in the air (glowing yellow orb)
        if (bullet.phase === 'rising') {
          return (
            <mesh key={bullet.id} position={bullet.position}>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshBasicMaterial color="#eab308" />
              <pointLight color="#eab308" intensity={0.6} distance={2.5} />
            </mesh>
          );
        }

        return null;
      })}

      {/* Render active 3D particles */}
      {particles.map((p) => (
        <mesh key={p.id} position={p.position}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshBasicMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}

      {/* The 2D Player Sprite Billboard */}
      <mesh
        ref={playerRef}
        castShadow
        receiveShadow
        position={[0, 1.28, 0]}
      >
        <planeGeometry args={[2.56, 2.56]} />
        <meshStandardMaterial
          map={clonedPlayerTexture}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Warp Gate Portal */}
      {warpActive && (
        <WarpGate
          position={warpPos}
          playerPosRef={playerPosRef}
          onEnter={() => {
            soundEngine.playCoin(); // warp enter sound
            setGameState('ENDING');
            setWarpActive(false);
          }}
        />
      )}

      {/* 3D NPC Character (appears in ENDING state) */}
      {gameState === 'ENDING' && (
        <NpcSprite
          position={npcPos}
          texture={npcTexture}
          isMoving={isNpcMoving}
          isFacingLeft={playerPosRef.current.x < npcPos.x}
        />
      )}
    </group>
  );
}

// Loading Fallback Spinner Screen
function SceneLoader() {
  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-xs uppercase tracking-widest font-mono text-gray-400">Loading game assets...</span>
    </div>
  );
}

const ENDING_DIALOGUES = [
  {
    speaker: 'NPC' as const,
    name: 'ผู้เฒ่าโพนชัย (Elder)',
    text: 'โอ้! ผู้พิทักษ์แห่งหน้ากากโบราณ! ท่านสามารถกำราบราชาปีศาจและปกป้องผืนแผ่นดินด่านซ้ายสำเร็จแล้ว!',
  },
  {
    speaker: 'PLAYER' as const,
    name: 'ตัวเรา (Guardian)',
    text: 'ข้าทำเต็มที่เพื่อปกป้องความสงบสุขของหมู่บ้าน และรักษาสืบสานประเพณีของพวกเรา',
  },
  {
    speaker: 'NPC' as const,
    name: 'ผู้เฒ่าโพนชัย (Elder)',
    text: 'พลังสัจจะและไมตรีเบื้องหน้าองค์พระธาตุศรีสองรัก ช่างงดงามและแผ่บารมีคุ้มครองผู้คนยิ่งนัก',
  },
  {
    speaker: 'PLAYER' as const,
    name: 'ตัวเรา (Guardian)',
    text: 'ใช่แล้ว... ชัยชนะครั้งนี้ไม่ใช่เพียงของข้า แต่เป็นเพราะพลังแห่งความสามัคคีของทุกคน',
  },
  {
    speaker: 'NPC' as const,
    name: 'ผู้เฒ่าโพนชัย (Elder)',
    text: 'ตำนานหน้ากากผีตาโขนอันเกรียงไกรนี้ จะถูกจารึกและเล่าขานสืบไปชั่วลูกชั่วหลานตราบนานเท่านาน',
  },
  {
    speaker: 'PLAYER' as const,
    name: 'ตัวเรา (Guardian)',
    text: 'จากนี้ไป ขอให้ความสุข เสียงดนตรี และความรื่นเริงหวนคืนสู่ลุ่มน้ำหมันดั่งเดิม',
  },
  {
    speaker: 'NPC' as const,
    name: 'ผู้เฒ่าโพนชัย (Elder)',
    text: 'พวกเราชาวด่านซ้าย ขอขอบคุณท่านจากใจจริง... ท่านคือวีรบุรุษตัวจริงของพวกเรา!',
  },
  {
    speaker: 'PLAYER' as const,
    name: 'ตัวเรา (Guardian)',
    text: 'ขอให้อานุภาพแห่งพระธาตุศรีสองรักดลบันดาลความร่มเย็นเป็นสุขแก่ทุกคนตลอดไป... บ๊ายบายความชั่วร้าย!',
  },
];

export default function GameCanvas({ bindings, onExit }: GameCanvasProps) {
  const [selectedMask, setSelectedMask] = useState<MaskOption | null>(null);
  const [gameState, setGameState] = useState<'SELECT' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' | 'ENDING'>('SELECT');
  const [score, setScore] = useState(0);
  const [flowersCollected, setFlowersCollected] = useState(0); // Gold cotton flowers gathered (Goal: 15)
  const [health, setHealth] = useState(5);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [isPaused, setIsPaused] = useState(false);
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // Exposed shared ref for coordinates to connect Three with the HTML controls
  const playerPosRef = useRef(new THREE.Vector3(0, 1.28, 5));

  // Expose shared ref to register keys from both physical keyboard and virtual buttons
  const controlsRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    attack: false,
    dance: false,
    jump: false,
  });

  // Sound BGM effects loop syncs
  useEffect(() => {
    if (gameState === 'PLAYING' && !isPaused) {
      soundEngine.startBGM();
    } else {
      soundEngine.stopBGM();
    }
    return () => {
      soundEngine.stopBGM();
    };
  }, [gameState, isPaused]);

  // Bind keypresses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      
      // Stop page scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
      }

      if (code === 'KeyW' || code === 'ArrowUp') controlsRef.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') controlsRef.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') controlsRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') controlsRef.current.right = true;
      if (code === 'KeyP') controlsRef.current.attack = true;
      if (code === 'KeyO') controlsRef.current.dance = true;
      if (code === 'Space') controlsRef.current.jump = true;

      if (code === 'Escape' && gameState === 'PLAYING') {
        e.preventDefault();
        setIsPaused((prev) => {
          const next = !prev;
          soundEngine.playSelect();
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') controlsRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') controlsRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') controlsRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') controlsRef.current.right = false;
      if (code === 'KeyP') controlsRef.current.attack = false;
      if (code === 'KeyO') controlsRef.current.dance = false;
      if (code === 'Space') controlsRef.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const toggleMute = () => {
    soundEngine.playSelect();
    const currentMute = soundEngine.toggleMute();
    setIsMuted(currentMute);
    if (!currentMute && gameState === 'PLAYING' && !isPaused) {
      soundEngine.startBGM();
    }
  };

  const handleStartGame = (mask: MaskOption) => {
    soundEngine.playSelect();
    setSelectedMask(mask);
    setScore(0);
    setFlowersCollected(0);
    setHealth(5);
    setDefeatedCount(0);
    setIsPaused(false);
    setDialogueIndex(0);
    playerPosRef.current.set(0, 1.28, 5); // start slightly in front of pagoda
    setGameState('PLAYING');
  };

  const restartFromDeath = () => {
    soundEngine.playSelect();
    setScore(0);
    setFlowersCollected(0);
    setHealth(5);
    setDefeatedCount(0);
    setIsPaused(false);
    setDialogueIndex(0);
    playerPosRef.current.set(0, 1.28, 5);
    setGameState('PLAYING');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-black border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.04)] relative overflow-hidden flex flex-col min-h-[600px] elegant-radial-bg">
      
      {/* 1. TOP STATUS HUD */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundEngine.playSelect();
              onExit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10 transition cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>EXIT</span>
          </button>

          {selectedMask && gameState === 'PLAYING' && (
            <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedMask.color }} />
              <span className="text-xs text-gray-300 font-bold uppercase tracking-widest">{selectedMask.nameTh}</span>
            </div>
          )}
        </div>

        {gameState === 'PLAYING' && (
          <div className="flex items-center gap-5">
            {/* Hearts HP */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, idx) => (
                <Heart
                  key={idx}
                  size={16}
                  className={`transition duration-300 ${
                    idx < health ? 'text-red-500 fill-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-gray-800'
                  }`}
                />
              ))}
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 text-white font-bold">
              <Trophy size={14} className="text-gray-400" />
              <span className="font-mono text-sm">{score}</span>
            </div>

            {/* Defeated Enemies Counter */}
            <div className="flex flex-col items-end">
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">DEFEATED</div>
              <div className="text-[11px] font-mono font-bold">
                {defeatedCount >= 10 ? (
                  <span className="text-red-500 animate-pulse">👺 BOSS ACTIVE</span>
                ) : (
                  <span className="text-gray-300">{defeatedCount} / 10</span>
                )}
              </div>
            </div>

            {/* Gold Cotton Flowers Goal */}
            <div className="flex flex-col items-end">
              <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">GOLD COTTON OFFERINGS</div>
              <div className="text-[11px] text-white font-mono font-bold">
                {flowersCollected} / 15
              </div>
            </div>
          </div>
        )}

        <button
          onClick={toggleMute}
          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/10 transition cursor-pointer"
          title={isMuted ? 'เปิดเสียงเกม' : 'ปิดเสียงเกม'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {/* 2. CORE GAME VIEWPORT CONTAINER */}
      <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black flex-1 min-h-[380px] flex flex-col justify-center items-center">
        
        {/* CHARACTER MASK SELECTOR SCREEN */}
        {gameState === 'SELECT' && (
          <div className="w-full h-full absolute inset-0 bg-black p-6 md:p-8 flex flex-col justify-between overflow-y-auto scrollbar-none z-20 elegant-radial-bg">
            <div className="text-center max-w-xl mx-auto space-y-2 mt-2">
              <h3 className="text-xl md:text-2xl font-black text-white font-sans tracking-widest uppercase">
                SELECT YOUR SPIRIT MASK
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                เลือกสวมหน้ากากผีตาโขนตามระดับสายพลัง ผจญภัยเก็บดอกฝ้ายทองคำเพื่อนำขึ้นไปสักการะพระธาตุศรีสองรักด่านซ้าย จ.เลย
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6 max-w-4xl mx-auto w-full">
              {MASK_OPTIONS.map((mask) => (
                <button
                  key={mask.id}
                  onClick={() => handleStartGame(mask)}
                  className="group relative p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/45 rounded-xl transition-all duration-300 text-left flex flex-col justify-between hover:-translate-y-0.5 shadow-lg overflow-hidden cursor-pointer"
                >
                  <div
                    className="absolute -right-16 -top-16 w-32 h-32 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition duration-300"
                    style={{ backgroundColor: mask.color }}
                  />

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-inner relative overflow-hidden border"
                        style={{ backgroundColor: `${mask.color}15`, borderColor: mask.color }}
                      >
                        <div className="absolute top-0 w-5 h-4 bg-white/10 rotate-45 border-r border-t border-white/20" />
                        <span className="text-lg">👺</span>
                      </div>

                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-widest uppercase"
                        style={{ color: mask.color, borderColor: `${mask.color}30`, backgroundColor: `${mask.color}10` }}
                      >
                        {mask.skillTh}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-white text-sm font-sans group-hover:text-white transition tracking-wide">
                      {mask.nameTh}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-sans min-h-[50px]">
                      {mask.descriptionTh}
                    </p>
                  </div>

                  {/* Character stats bar */}
                  <div className="space-y-1.5 mt-4 pt-4 border-t border-white/10 w-full">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-gray-500 font-semibold uppercase">SPEED</span>
                      <span className="text-white font-bold font-mono">{mask.statSpeed}/5</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full rounded-full" style={{ width: `${(mask.statSpeed / 5) * 100}%` }} />
                    </div>

                    <div className="flex justify-between text-[9px] mt-1.5">
                      <span className="text-gray-500 font-semibold uppercase">JUMP HEIGHT</span>
                      <span className="text-white font-bold font-mono">{mask.statJump}/5</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-white h-full rounded-full" style={{ width: `${(mask.statJump / 5) * 100}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-[10px] text-white font-bold uppercase tracking-wider group-hover:translate-x-1 transition-all duration-300">
                    <Play size={8} fill="currentColor" />
                    <span>CHOOSE MASK</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center text-[10px] text-gray-500 mb-2 font-mono">
              * เคลื่อนที่ด้วยแป้นพิมพ์ WASD / ปุ่มลูกศร • กด SPACE เพื่อกระโดด • กด P ฟันดาบพะเนียง • กด O ร่ายรำวิเศษ
            </div>
          </div>
        )}

        {/* THREEJS FIBER PLAYING CONTAINER SCREEN */}
        {(gameState === 'PLAYING' || gameState === 'ENDING') && selectedMask && (
          <div className="w-full h-full relative flex flex-col justify-between">
            <Canvas shadows camera={{ position: [0, 5.5, 9.5], fov: 50 }} className="w-full h-full">
              <color attach="background" args={['#030712']} />
              <fog attach="fog" args={['#030712', 15, 30]} />
              
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[15, 20, 15]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
              />

              <Suspense fallback={null}>
                <GameScene
                  selectedMask={selectedMask}
                  bindings={bindings}
                  controlsRef={controlsRef}
                  onUpdateHP={(hp) => setHealth(hp)}
                  onUpdateScore={(score) => setScore(score)}
                  onUpdateFlowers={(flowers) => setFlowersCollected(flowers)}
                  onUpdateDefeatedCount={(defeated) => setDefeatedCount(defeated)}
                  gameState={gameState}
                  setGameState={setGameState}
                  playerPosRef={playerPosRef}
                  isPaused={isPaused}
                />
              </Suspense>
            </Canvas>

            {/* Gold Cotton Offerings Goal HUD Floating Progress Banner */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-52 bg-black/85 border border-white/15 rounded-full h-4 overflow-hidden p-0.5 shadow-md flex items-center">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, (flowersCollected / 15) * 100)}%` }}
              />
              <span className="absolute inset-0 text-[8px] font-bold tracking-widest text-white uppercase flex items-center justify-center">
                OFFERINGS: {flowersCollected} / 15 ({Math.round((flowersCollected / 15) * 100)}%)
              </span>
            </div>

            {/* Boss Warning Banner */}
            {defeatedCount >= 10 && (
              <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-red-600/90 border border-red-500 text-white font-sans font-black text-[9px] tracking-[0.2em] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20 uppercase animate-bounce flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                <span>WARNING: BOSS PHI TA KHON APPEARED! 👺</span>
              </div>
            )}

            {/* GAME PAUSED OVERLAY PANEL */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-yellow-500 mb-4 animate-pulse">
                  <Play size={24} className="rotate-90 fill-current ml-1" />
                </div>
                <div className="space-y-1 mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-white font-sans tracking-widest uppercase">
                    GAME PAUSED
                  </h3>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                    เกมหยุดชั่วคราว กด <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/15">ESC</span> เพื่อกลับเข้าสู่เกม หรือคลิกปุ่มด้านล่าง
                  </p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button
                    onClick={() => {
                      soundEngine.playSelect();
                      setIsPaused(false);
                    }}
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs tracking-widest rounded-lg transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    RESUME GAME
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playSelect();
                      setIsPaused(false);
                      setGameState('SELECT');
                    }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs tracking-widest rounded-lg border border-white/10 transition cursor-pointer"
                  >
                    EXIT TO SELECT
                  </button>
                </div>
              </div>
            )}

            {/* RPG STYLE ENDING DIALOGUE OVERLAY */}
            {gameState === 'ENDING' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none flex flex-col justify-end p-4 md:p-6 z-30">
                <div className="w-full bg-black/90 border-2 border-white/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto animate-fade-in">
                  
                  {/* Portrait Column */}
                  <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-white/25 bg-gray-900 relative">
                    {/* Retro CSS Sprite Sheet zoom rendering */}
                    {ENDING_DIALOGUES[dialogueIndex]?.speaker === 'NPC' ? (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/npc1_pdraha.png')`,
                          backgroundSize: '200% 200%',
                          backgroundPosition: '0% 0%', // Frame 0
                          imageRendering: 'pixelated',
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url('https://res.cloudinary.com/dd86koakl/image/upload/v1782440053/player_mask_fvzlz7.png')`,
                          backgroundSize: '400% 400%',
                          backgroundPosition: selectedMask?.id === 'lek' ? '0% 0%' : selectedMask?.id === 'yai' ? '25% 0%' : '50% 0%', // Match their frame 0
                          imageRendering: 'pixelated',
                        }}
                      />
                    )}
                  </div>

                  {/* Text and Next Action Column */}
                  <div className="flex-grow space-y-2 w-full text-left">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-extrabold px-2.5 py-0.5 rounded-full border tracking-wider uppercase font-sans text-white"
                        style={{
                          borderColor: ENDING_DIALOGUES[dialogueIndex]?.speaker === 'NPC' ? '#38bdf8' : selectedMask?.color,
                          backgroundColor: ENDING_DIALOGUES[dialogueIndex]?.speaker === 'NPC' ? 'rgba(56,189,248,0.15)' : `${selectedMask?.color}20`,
                        }}
                      >
                        {ENDING_DIALOGUES[dialogueIndex]?.name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        {dialogueIndex + 1} / 8 SENTENCES
                      </span>
                    </div>

                    <p className="text-gray-100 text-xs md:text-sm leading-relaxed font-sans min-h-[48px]">
                      {ENDING_DIALOGUES[dialogueIndex]?.text}
                    </p>

                    <div className="flex justify-end pt-1">
                      {dialogueIndex < ENDING_DIALOGUES.length - 1 ? (
                        <button
                          onClick={() => {
                            soundEngine.playSelect();
                            setDialogueIndex((prev) => prev + 1);
                          }}
                          className="px-4 py-1.5 bg-white text-black font-extrabold text-[10px] tracking-widest rounded border border-white hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>NEXT</span>
                          <span className="text-[8px]">▶</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundEngine.playSelect();
                            // Transition to the final celebrated victory/finish state
                            setGameState('VICTORY');
                          }}
                          className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs tracking-widest rounded shadow-[0_0_15px_rgba(245,158,11,0.4)] transition flex items-center gap-1 animate-pulse cursor-pointer"
                        >
                          <span>FINISH & RETURN</span>
                          <span className="text-[10px]">✨</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GAME OVER CARD */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-6 z-20 animate-fade-in elegant-radial-bg">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/25 flex items-center justify-center text-white float-anim">
              <AlertCircle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-white font-sans tracking-widest uppercase">
                GAME OVER
              </h3>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                หน้ากากลัญจกรพิทักษ์ถูกทำลายลงจนสิ้นพลังชีวิตแล้ว! แต่ความตั้งใจที่จะทำพิธีบูชากลางวัดโพนชัยด่านซ้ายจะพยุงคุณกลับขึ้นมาอีกครั้ง
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-2 gap-6 min-w-[240px] backdrop-blur-sm">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">SCORE</span>
                <span className="text-xl font-black text-white font-mono">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">OFFERINGS</span>
                <span className="text-xl font-black text-gray-300 font-mono">{flowersCollected} / 15</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartFromDeath}
                className="px-5 py-2.5 bg-white text-black font-extrabold text-xs tracking-widest rounded-lg transition shadow-md hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                TRY AGAIN
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelect();
                  onExit();
                }}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs tracking-widest rounded-lg border border-white/10 transition cursor-pointer"
              >
                EXIT TO MENU
              </button>
            </div>
          </div>
        )}

        {/* VICTORY / STAGE CLEAR CARD */}
        {gameState === 'VICTORY' && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-6 z-20 elegant-radial-bg">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white float-anim">
              <Sparkles size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-white font-sans tracking-widest uppercase">
                SACRED VICTORY
              </h3>
              <p className="text-[11px] text-gray-300 max-w-sm mx-auto leading-relaxed">
                คุณได้รวบรวมดอกฝ้ายทองคำเพื่อนำถวายเบื้องหน้าองค์พระธาตุศรีสองรักด่านซ้ายได้อย่างบริบูรณ์ บารมีและประเพณีผีตาโขนจะแผ่ความร่มเย็นไปทั่วลุ่มน้ำหมันตราบนานเท่านาน!
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-xl grid grid-cols-2 gap-8 min-w-[280px] backdrop-blur-sm">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">FINAL SCORE</span>
                <span className="text-2xl font-black text-white font-mono">{score + 1500}</span>
                <span className="text-[9px] text-emerald-400 font-bold block mt-1 tracking-wider uppercase">+1,500 SACRED BONUS</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">MASK ADVENTURED</span>
                <span className="text-xs font-bold text-gray-300 block mt-2 uppercase tracking-wide">{selectedMask?.nameTh}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartFromDeath}
                className="px-5 py-2.5 bg-white text-black font-extrabold text-xs tracking-widest rounded-lg transition shadow-md hover:bg-gray-100 cursor-pointer"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelect();
                  onExit();
                }}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs tracking-widest rounded-lg border border-white/10 transition cursor-pointer"
              >
                EXIT TO MENU
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. RETRO CONTROLLER TOUCH OVERLAY PANEL (Specifically designed for preview frame responsiveness) */}
      {gameState === 'PLAYING' && (
        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3 md:p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider text-center md:text-left">
              * Click / Hold or Touch on-screen buttons below to navigate easily inside the iframe player:
            </span>

            {/* Virtual Interactive Pad Buttons */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
              <button
                onMouseDown={() => { controlsRef.current.left = true; }}
                onMouseUp={() => { controlsRef.current.left = false; }}
                onMouseLeave={() => { controlsRef.current.left = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.left = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.left = false; }}
                className="px-3 py-1.5 bg-white/5 active:bg-white/15 border border-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-widest select-none cursor-pointer"
              >
                ◀ LEFT (A)
              </button>
              <button
                onMouseDown={() => { controlsRef.current.right = true; }}
                onMouseUp={() => { controlsRef.current.right = false; }}
                onMouseLeave={() => { controlsRef.current.right = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.right = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.right = false; }}
                className="px-3 py-1.5 bg-white/5 active:bg-white/15 border border-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-widest select-none cursor-pointer"
              >
                RIGHT (D) ▶
              </button>
              <button
                onMouseDown={() => { controlsRef.current.forward = true; }}
                onMouseUp={() => { controlsRef.current.forward = false; }}
                onMouseLeave={() => { controlsRef.current.forward = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.forward = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.forward = false; }}
                className="px-3 py-1.5 bg-white/5 active:bg-white/15 border border-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-widest select-none cursor-pointer"
              >
                ▲ UP (W)
              </button>
              <button
                onMouseDown={() => { controlsRef.current.backward = true; }}
                onMouseUp={() => { controlsRef.current.backward = false; }}
                onMouseLeave={() => { controlsRef.current.backward = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.backward = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.backward = false; }}
                className="px-3 py-1.5 bg-white/5 active:bg-white/15 border border-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-widest select-none cursor-pointer"
              >
                DOWN (S) ▼
              </button>
              <button
                onMouseDown={() => { controlsRef.current.jump = true; }}
                onMouseUp={() => { controlsRef.current.jump = false; }}
                onMouseLeave={() => { controlsRef.current.jump = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.jump = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.jump = false; }}
                className="px-3 py-1.5 bg-white/10 active:bg-white/20 border border-white/15 rounded text-[10px] font-bold text-white uppercase tracking-widest select-none cursor-pointer"
              >
                ▲ JUMP (SPACE)
              </button>
              <button
                onMouseDown={() => { controlsRef.current.attack = true; }}
                onMouseUp={() => { controlsRef.current.attack = false; }}
                onMouseLeave={() => { controlsRef.current.attack = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.attack = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.attack = false; }}
                className="px-3 py-1.5 bg-white/10 active:bg-white/25 border border-white/20 rounded text-[10px] font-bold text-yellow-300 uppercase tracking-widest select-none cursor-pointer"
              >
                ⚔️ ATTACK (P)
              </button>
              <button
                onMouseDown={() => { controlsRef.current.dance = true; }}
                onMouseUp={() => { controlsRef.current.dance = false; }}
                onMouseLeave={() => { controlsRef.current.dance = false; }}
                onTouchStart={(e) => { e.preventDefault(); controlsRef.current.dance = true; }}
                onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.dance = false; }}
                className="px-3 py-1.5 bg-white/10 active:bg-white/25 border border-white/20 rounded text-[10px] font-bold text-pink-400 uppercase tracking-widest select-none cursor-pointer"
              >
                👺 DANCE (O)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
