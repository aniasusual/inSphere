import * as THREE from "three";
import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";

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
  animation = "CharacterArmature|Idle",
  ...props
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Hoodie Character.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as GLTFResult;
  const { actions } = useAnimations(animations, group);

  // Forward the ref to the outer group
  // useImperativeHandle(ref, () => group.current!, []);

  const position = useMemo(() => props.position, []);

  useEffect(() => {
    const action = actions[animation];
    if (action) {
      action.reset().fadeIn(0.5).play();
      return () => {
        action.fadeOut(0.5);
      };
    }
  }, [animation]);

  return (
    <group ref={group} position={position} {...props} dispose={null}>
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
