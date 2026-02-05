import { View } from "react-native";
import React from "react";
import Svg, { Path, Rect, Defs, ClipPath } from "react-native-svg";
import { computeStarFills } from "@/infrastructure/reviews/review.star-rating.service";

interface RatingStarRatioInterface {
  rating: number;
  size: number;
  starFilledColor: string;
  starHollowedColor: string;
}

export default function RatingStarRatio({
  starFilledColor,
  starHollowedColor,
  rating,
  size,
}: RatingStarRatioInterface) {
  const fills = computeStarFills(rating);

  const STAR_PATH =
    "M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.168L12 18.897l-7.334 3.863 1.4-8.168L.132 9.21l8.2-1.192z";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {fills.map((fill, i) => {
        const clipId = `clip-star-${i}-${Math.random()}`;
        return (
          <View
            key={i}
            style={{ width: size, height: size, marginHorizontal: 2 }}
          >
            <Svg width="100%" height="100%" viewBox="0 0 24 24">
              <Defs>
                <ClipPath id={clipId}>
                  <Rect x="0" y="0" width={24 * fill} height="24" />
                </ClipPath>
              </Defs>
              <Path d={STAR_PATH} fill={starHollowedColor} />
              <Path
                d={STAR_PATH}
                fill={starFilledColor}
                clipPath={`url(#${clipId})`}
              />
            </Svg>
          </View>
        );
      })}
    </View>
  );
}
