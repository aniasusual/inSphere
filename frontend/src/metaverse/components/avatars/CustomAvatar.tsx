// import * as THREE from "three";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { useFrame, useGraph } from "@react-three/fiber";
// import { useGLTF, useAnimations } from "@react-three/drei";
// import { GLTF, SkeletonUtils } from "three-stdlib";

// const MOVEMENT_SPEED = 0.05;

// type ActionName =
//   | "CharacterArmature|Death"
//   | "CharacterArmature|Gun_Shoot"
//   | "CharacterArmature|HitRecieve"
//   | "CharacterArmature|HitRecieve_2"
//   | "CharacterArmature|Idle"
//   | "CharacterArmature|Idle_Gun"
//   | "CharacterArmature|Idle_Gun_Pointing"
//   | "CharacterArmature|Idle_Gun_Shoot"
//   | "CharacterArmature|Idle_Neutral"
//   | "CharacterArmature|Idle_Sword"
//   | "CharacterArmature|Interact"
//   | "CharacterArmature|Kick_Left"
//   | "CharacterArmature|Kick_Right"
//   | "CharacterArmature|Punch_Left"
//   | "CharacterArmature|Punch_Right"
//   | "CharacterArmature|Roll"
//   | "CharacterArmature|Run"
//   | "CharacterArmature|Run_Back"
//   | "CharacterArmature|Run_Left"
//   | "CharacterArmature|Run_Right"
//   | "CharacterArmature|Run_Shoot"
//   | "CharacterArmature|Sword_Slash"
//   | "CharacterArmature|Walk"
//   | "CharacterArmature|Wave";

// interface GLTFAction extends THREE.AnimationClip {
//   name: ActionName;
// }

// type GLTFResult = GLTF & {
//   nodes: {
//     Casual_Feet_1: THREE.SkinnedMesh;
//     Casual_Feet_2: THREE.SkinnedMesh;
//     Casual_Legs_1: THREE.SkinnedMesh;
//     Casual_Legs_2: THREE.SkinnedMesh;
//     Casual_Head_1: THREE.SkinnedMesh;
//     Casual_Head_2: THREE.SkinnedMesh;
//     Casual_Head_3: THREE.SkinnedMesh;
//     Casual_Head_4: THREE.SkinnedMesh;
//     Casual_Body_1: THREE.SkinnedMesh;
//     Casual_Body_2: THREE.SkinnedMesh;
//     Root: THREE.Bone;
//   };
//   materials: {
//     White: THREE.MeshStandardMaterial;
//     Purple: THREE.MeshStandardMaterial;
//     Skin: THREE.MeshStandardMaterial;
//     LightBlue: THREE.MeshStandardMaterial;
//     Eyebrows: THREE.MeshStandardMaterial;
//     Eye: THREE.MeshStandardMaterial;
//     Hair: THREE.MeshStandardMaterial;
//   };
//   animations: GLTFAction[];
// };

// export const CustomAvatar = ({
//   url = "",
//   otherUser = false,
//   // position,
//   ...props
// }: any) => {
//   const position = useMemo(() => props.position, []);

//   const group = useRef<THREE.Group>(null);
//   const { scene, animations } = useGLTF("/models/Hoodie Character.glb");
//   const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
//   const { nodes, materials } = useGraph(clone) as GLTFResult;
//   const { actions } = useAnimations(animations, group);
//   const [animation, setAnimation] = useState("CharacterArmature|Idle");

//   useEffect(() => {
//     const action = actions[animation];
//     if (action) {
//       action.reset().fadeIn(0.5).play();
//       return () => {
//         action.fadeOut(0.5);
//       };
//     }
//   }, [animation]);

//   useFrame(() => {
//     if (group.current) {
//       if (group.current.position.distanceTo(position) > 0.1) {
//         const direction = group.current.position
//           .clone()
//           .sub(position)
//           .normalize()
//           .multiplyScalar(MOVEMENT_SPEED);

//         group.current.position.sub(direction);
//         group.current.lookAt(position);
//         // setAnimation("CharacterArmature|Run");
//       }
//       //  else {
//       //   setAnimation("CharacterArmature|Idle");
//       // }
//     }
//   });

//   return (
//     <group ref={group} position={position} {...props} dispose={null}>
//       <group name="Root_Scene">
//         <group name="RootNode">
//           <group
//             name="CharacterArmature"
//             rotation={[-Math.PI / 2, 0, 0]}
//             scale={100}
//           >
//             <primitive object={nodes.Root} />
//           </group>
//           <group name="Casual_Feet" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//             <skinnedMesh
//               geometry={nodes.Casual_Feet_1.geometry}
//               material={materials.White}
//               skeleton={nodes.Casual_Feet_1.skeleton}
//             >
//               <meshStandardMaterial color="pink" />
//             </skinnedMesh>
//             <skinnedMesh
//               geometry={nodes.Casual_Feet_2.geometry}
//               material={materials.Purple}
//               skeleton={nodes.Casual_Feet_2.skeleton}
//             >
//               <meshStandardMaterial color="red" />
//             </skinnedMesh>
//           </group>
//           <group name="Casual_Legs" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//             <skinnedMesh
//               geometry={nodes.Casual_Legs_1.geometry}
//               material={materials.Skin}
//               skeleton={nodes.Casual_Legs_1.skeleton}
//             />
//             <skinnedMesh
//               geometry={nodes.Casual_Legs_2.geometry}
//               material={materials.LightBlue}
//               skeleton={nodes.Casual_Legs_2.skeleton}
//             />
//           </group>
//           <group name="Casual_Head" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//             <skinnedMesh
//               geometry={nodes.Casual_Head_1.geometry}
//               material={materials.Skin}
//               skeleton={nodes.Casual_Head_1.skeleton}
//             />
//             <skinnedMesh
//               geometry={nodes.Casual_Head_2.geometry}
//               material={materials.Eyebrows}
//               skeleton={nodes.Casual_Head_2.skeleton}
//             />
//             <skinnedMesh
//               geometry={nodes.Casual_Head_3.geometry}
//               material={materials.Eye}
//               skeleton={nodes.Casual_Head_3.skeleton}
//             />
//             <skinnedMesh
//               geometry={nodes.Casual_Head_4.geometry}
//               material={materials.Hair}
//               skeleton={nodes.Casual_Head_4.skeleton}
//             ></skinnedMesh>
//           </group>
//           <group
//             name="Casual_Body"
//             position={[0, 0.007, 0]}
//             rotation={[-Math.PI / 2, 0, 0]}
//             scale={100}
//           >
//             <skinnedMesh
//               geometry={nodes.Casual_Body_1.geometry}
//               material={materials.Purple}
//               skeleton={nodes.Casual_Body_1.skeleton}
//             ></skinnedMesh>
//             <skinnedMesh
//               geometry={nodes.Casual_Body_2.geometry}
//               material={materials.Skin}
//               skeleton={nodes.Casual_Body_2.skeleton}
//             />
//           </group>
//         </group>
//       </group>
//     </group>
//   );
// };

// useGLTF.preload("/models/Hoodie Character.glb");
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";

const MOVEMENT_SPEED = 0.05; // Increased movement speed for more noticeable movement

type ActionName =
  | "CharacterArmature|Death"
  | "CharacterArmature|Gun_Shoot"
  | "CharacterArmature|HitRecieve"
  | "CharacterArmature|HitRecieve_2"
  | "CharacterArmature|Idle"
  | "CharacterArmature|Idle_Gun"
  | "CharacterArmature|Idle_Gun_Pointing"
  | "CharacterArmature|Idle_Gun_Shoot"
  | "CharacterArmature|Idle_Neutral"
  | "CharacterArmature|Idle_Sword"
  | "CharacterArmature|Interact"
  | "CharacterArmature|Kick_Left"
  | "CharacterArmature|Kick_Right"
  | "CharacterArmature|Punch_Left"
  | "CharacterArmature|Punch_Right"
  | "CharacterArmature|Roll"
  | "CharacterArmature|Run"
  | "CharacterArmature|Run_Back"
  | "CharacterArmature|Run_Left"
  | "CharacterArmature|Run_Right"
  | "CharacterArmature|Run_Shoot"
  | "CharacterArmature|Sword_Slash"
  | "CharacterArmature|Walk"
  | "CharacterArmature|Wave";

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    Casual_Feet_1: THREE.SkinnedMesh;
    Casual_Feet_2: THREE.SkinnedMesh;
    Casual_Legs_1: THREE.SkinnedMesh;
    Casual_Legs_2: THREE.SkinnedMesh;
    Casual_Head_1: THREE.SkinnedMesh;
    Casual_Head_2: THREE.SkinnedMesh;
    Casual_Head_3: THREE.SkinnedMesh;
    Casual_Head_4: THREE.SkinnedMesh;
    Casual_Body_1: THREE.SkinnedMesh;
    Casual_Body_2: THREE.SkinnedMesh;
    Root: THREE.Bone;
  };
  materials: {
    White: THREE.MeshStandardMaterial;
    Purple: THREE.MeshStandardMaterial;
    Skin: THREE.MeshStandardMaterial;
    LightBlue: THREE.MeshStandardMaterial;
    Eyebrows: THREE.MeshStandardMaterial;
    Eye: THREE.MeshStandardMaterial;
    Hair: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export const CustomAvatar = ({
  url = "",
  otherUser = false,
  position: targetPosition,
  ...props
}: any) => {
  // Store the target position as a ref so we can compare it in useFrame
  const targetPositionRef = useRef(new THREE.Vector3());

  // Set up initial position
  const initialPosition = useMemo(() => {
    if (targetPosition instanceof THREE.Vector3) {
      return targetPosition.clone();
    } else if (Array.isArray(targetPosition)) {
      return new THREE.Vector3(
        targetPosition[0],
        targetPosition[1],
        targetPosition[2]
      );
    }
    return new THREE.Vector3(0, 0, 0);
  }, []);

  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Hoodie Character.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as GLTFResult;
  const { actions } = useAnimations(animations, group);
  const [animation, setAnimation] = useState<ActionName>(
    "CharacterArmature|Idle"
  );
  const [isMoving, setIsMoving] = useState(false);

  // Update the target position ref when the prop changes
  useEffect(() => {
    if (targetPosition instanceof THREE.Vector3) {
      targetPositionRef.current.copy(targetPosition);
    } else if (Array.isArray(targetPosition)) {
      targetPositionRef.current.set(
        targetPosition[0],
        targetPosition[1],
        targetPosition[2]
      );
    }
  }, [targetPosition]);

  // Handle animation state
  useEffect(() => {
    Object.values(actions).forEach((action) => action?.stop());

    const action = actions[animation];
    if (action) {
      action.reset().fadeIn(0.5).play();
    }

    return () => {
      action?.fadeOut(0.5);
    };
  }, [animation, actions]);

  useFrame(() => {
    if (!group.current) return;

    // Calculate distance to target
    const distance = group.current.position.distanceTo(
      targetPositionRef.current
    );

    // Log for debugging
    // console.log("Distance to target:", distance, "Current:", group.current.position.toArray(), "Target:", targetPositionRef.current.toArray());

    if (distance > 0.1) {
      // Only move if we're not already very close
      // Calculate movement direction
      const direction = new THREE.Vector3();
      direction
        .subVectors(targetPositionRef.current, group.current.position)
        .normalize();

      // Apply movement
      group.current.position.add(direction.multiplyScalar(MOVEMENT_SPEED));

      // Make character face movement direction
      if (direction.length() > 0.01) {
        const lookAtPos = new THREE.Vector3().addVectors(
          group.current.position,
          new THREE.Vector3(direction.x, 0, direction.z).normalize()
        );
        group.current.lookAt(lookAtPos);
      }

      // Set running animation if not already
      if (!isMoving) {
        setAnimation("CharacterArmature|Run");
        setIsMoving(true);
      }
    } else if (isMoving) {
      // Switch back to idle when we've reached the target
      setAnimation("CharacterArmature|Idle");
      setIsMoving(false);
    }
  });

  return (
    <group ref={group} position={initialPosition} {...props} dispose={null}>
      <group name="Root_Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <primitive object={nodes.Root} />
          </group>
          <group name="Casual_Feet" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              geometry={nodes.Casual_Feet_1.geometry}
              material={materials.White}
              skeleton={nodes.Casual_Feet_1.skeleton}
            >
              <meshStandardMaterial color="pink" />
            </skinnedMesh>
            <skinnedMesh
              geometry={nodes.Casual_Feet_2.geometry}
              material={materials.Purple}
              skeleton={nodes.Casual_Feet_2.skeleton}
            >
              <meshStandardMaterial color="red" />
            </skinnedMesh>
          </group>
          <group name="Casual_Legs" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              geometry={nodes.Casual_Legs_1.geometry}
              material={materials.Skin}
              skeleton={nodes.Casual_Legs_1.skeleton}
            />
            <skinnedMesh
              geometry={nodes.Casual_Legs_2.geometry}
              material={materials.LightBlue}
              skeleton={nodes.Casual_Legs_2.skeleton}
            />
          </group>
          <group name="Casual_Head" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              geometry={nodes.Casual_Head_1.geometry}
              material={materials.Skin}
              skeleton={nodes.Casual_Head_1.skeleton}
            />
            <skinnedMesh
              geometry={nodes.Casual_Head_2.geometry}
              material={materials.Eyebrows}
              skeleton={nodes.Casual_Head_2.skeleton}
            />
            <skinnedMesh
              geometry={nodes.Casual_Head_3.geometry}
              material={materials.Eye}
              skeleton={nodes.Casual_Head_3.skeleton}
            />
            <skinnedMesh
              geometry={nodes.Casual_Head_4.geometry}
              material={materials.Hair}
              skeleton={nodes.Casual_Head_4.skeleton}
            ></skinnedMesh>
          </group>
          <group
            name="Casual_Body"
            position={[0, 0.007, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <skinnedMesh
              geometry={nodes.Casual_Body_1.geometry}
              material={materials.Purple}
              skeleton={nodes.Casual_Body_1.skeleton}
            ></skinnedMesh>
            <skinnedMesh
              geometry={nodes.Casual_Body_2.geometry}
              material={materials.Skin}
              skeleton={nodes.Casual_Body_2.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
};

useGLTF.preload("/models/Hoodie Character.glb");
