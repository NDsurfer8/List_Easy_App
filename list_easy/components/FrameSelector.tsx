import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 32;

type Box = { id: string; x: number; y: number; width: number; height: number };

type FrameSelectorProps = {
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  boxes: Box[];
  onBoxAdd: (box: { x: number; y: number; width: number; height: number }) => void;
  loading?: boolean;
};

export function FrameSelector({
  imageUri,
  imageWidth,
  imageHeight,
  boxes,
  onBoxAdd,
  loading,
}: FrameSelectorProps) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const scale = Math.min(1, IMAGE_WIDTH / imageWidth);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .runOnJS(true)
        .onStart((e) => {
          const x = e.x;
          const y = e.y;
          if (x >= 0 && x <= displayWidth && y >= 0 && y <= displayHeight) {
            startRef.current = { x, y };
            setStart({ x, y });
            setCurrent({ x, y });
          }
        })
        .onUpdate((e) => {
          if (startRef.current) {
            setCurrent({
              x: startRef.current.x + e.translationX,
              y: startRef.current.y + e.translationY,
            });
          }
        })
        .onEnd((e) => {
          const s = startRef.current;
          if (!s) {
            setStart(null);
            setCurrent(null);
            return;
          }
          const endX = s.x + e.translationX;
          const endY = s.y + e.translationY;
          const x = Math.min(s.x, endX);
          const y = Math.min(s.y, endY);
          const width = Math.abs(endX - s.x);
          const height = Math.abs(endY - s.y);
          if (width > 15 && height > 15) {
            onBoxAdd({
              x: (x / displayWidth) * 100,
              y: (y / displayHeight) * 100,
              width: (width / displayWidth) * 100,
              height: (height / displayHeight) * 100,
            });
          }
          startRef.current = null;
          setStart(null);
          setCurrent(null);
        }),
    [displayWidth, displayHeight, onBoxAdd]
  );

  const drawingBox = start && current ? (
    <Rect
      x={Math.min(start.x, current.x)}
      y={Math.min(start.y, current.y)}
      width={Math.abs(current.x - start.x)}
      height={Math.abs(current.y - start.y)}
      stroke="#3b82f6"
      strokeWidth={2}
      fill="rgba(59, 130, 246, 0.2)"
    />
  ) : null;

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.touchArea, { width: displayWidth, height: displayHeight }]}>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { width: displayWidth, height: displayHeight }]}
            resizeMode="stretch"
          />
          <Svg style={[StyleSheet.absoluteFill, { width: displayWidth, height: displayHeight }]}>
            {boxes.map((b) => (
              <Rect
                key={b.id}
                x={(b.x / 100) * displayWidth}
                y={(b.y / 100) * displayHeight}
                width={(b.width / 100) * displayWidth}
                height={(b.height / 100) * displayHeight}
                stroke="#22c55e"
                strokeWidth={2}
                fill="rgba(34, 197, 94, 0.15)"
              />
            ))}
            {drawingBox}
          </Svg>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Getting value…</Text>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  touchArea: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
});
