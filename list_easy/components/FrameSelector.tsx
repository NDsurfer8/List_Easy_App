import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from 'react-native';
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

  const scale = Math.min(1, IMAGE_WIDTH / imageWidth);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  const getCoords = (ev: NativeSyntheticEvent<NativeTouchEvent>) => {
    const e = ev.nativeEvent as unknown as { locationX: number; locationY: number; touches?: { locationX: number; locationY: number }[] };
    const t = e.touches?.[0];
    return { x: (t ?? e).locationX ?? 0, y: (t ?? e).locationY ?? 0 };
  };

  const onResponderGrant = useCallback(
    (ev: NativeSyntheticEvent<NativeTouchEvent>) => {
      const { x, y } = getCoords(ev);
      if (x >= 0 && x <= displayWidth && y >= 0 && y <= displayHeight) {
        setStart({ x, y });
        setCurrent({ x, y });
      }
    },
    [displayWidth, displayHeight]
  );

  const onResponderMove = useCallback(
    (ev: NativeSyntheticEvent<NativeTouchEvent>) => {
      if (start) {
        const { x, y } = getCoords(ev);
        setCurrent({ x, y });
      }
    },
    [start]
  );

  const onResponderRelease = useCallback(() => {
    if (start && current) {
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const width = Math.abs(current.x - start.x);
      const height = Math.abs(current.y - start.y);
      if (width > 15 && height > 15) {
        onBoxAdd({
          x: (x / displayWidth) * 100,
          y: (y / displayHeight) * 100,
          width: (width / displayWidth) * 100,
          height: (height / displayHeight) * 100,
        });
      }
      setStart(null);
      setCurrent(null);
    }
  }, [start, current, displayWidth, displayHeight, onBoxAdd]);

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
      <View
        style={[styles.touchArea, { width: displayWidth, height: displayHeight }]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={onResponderGrant}
        onResponderMove={onResponderMove}
        onResponderRelease={onResponderRelease}
      >
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
