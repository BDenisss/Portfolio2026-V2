// Génère une sphère jaune « émoji » : fixture de test de l'avatar 3D (aucune donnée personnelle).
import { mkdirSync } from 'node:fs'
import { Document, NodeIO } from '@gltf-transform/core'

const SEGMENTS = 24
const RINGS = 16
const RADIUS = 0.5
const OUTPUT = 'public/fixtures/avatar-fixture.glb'

function buildSphere() {
  const positions = []
  const normals = []
  for (let ring = 0; ring <= RINGS; ring++) {
    const phi = (ring / RINGS) * Math.PI
    for (let segment = 0; segment <= SEGMENTS; segment++) {
      const theta = (segment / SEGMENTS) * 2 * Math.PI
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)
      positions.push(x * RADIUS, y * RADIUS, z * RADIUS)
      normals.push(x, y, z)
    }
  }
  const indices = []
  for (let ring = 0; ring < RINGS; ring++) {
    for (let segment = 0; segment < SEGMENTS; segment++) {
      const a = ring * (SEGMENTS + 1) + segment
      const b = a + SEGMENTS + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  return { positions, normals, indices }
}

const document = new Document()
const buffer = document.createBuffer()
const { positions, normals, indices } = buildSphere()
const accessor = (type, array) => document.createAccessor().setType(type).setArray(array).setBuffer(buffer)

const material = document
  .createMaterial('emoji')
  .setBaseColorFactor([0.98, 0.82, 0.3, 1])
  .setRoughnessFactor(0.35)
  .setMetallicFactor(0)
const primitive = document
  .createPrimitive()
  .setAttribute('POSITION', accessor('VEC3', new Float32Array(positions)))
  .setAttribute('NORMAL', accessor('VEC3', new Float32Array(normals)))
  .setIndices(accessor('SCALAR', new Uint16Array(indices)))
  .setMaterial(material)
const node = document.createNode('head').setMesh(document.createMesh('head').addPrimitive(primitive))
document.createScene('fixture').addChild(node)

mkdirSync('public/fixtures', { recursive: true })
await new NodeIO().write(OUTPUT, document)
console.log(`${OUTPUT} écrit`)
