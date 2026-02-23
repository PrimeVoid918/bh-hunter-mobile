import { View, Text } from "react-native";
import React from "react";
import {
  FindOneBoardingHouse,
  OccupancyType,
  PatchBoardingHouseInput,
} from "@/infrastructure/boarding-houses/boarding-house.schema";
import {
  BoaBoardingHouseHeaderView,
  BoardingHouseHeaderEdit,
} from "./BoardingHouseHeader";
import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  BoardingHouseBodyEdit,
  BoardingHouseBodyView,
} from "./BoardingHouseBody";
import { Spacing } from "@/constants";

// interface BoardingHouseDetailsRenderInterface {
//   data: FindOneBoardingHouse;
//   mode: "view" | "modifiable";
//   control?: Control<PatchBoardingHouseInput>;
//   isEditing?: boolean;
//   errors?: FieldErrors<PatchBoardingHouseInput>;
//   form?: {
//     getValues: UseFormGetValues<PatchBoardingHouseInput>;
//     setValue: UseFormSetValue<PatchBoardingHouseInput>;
//     watch: UseFormWatch<PatchBoardingHouseInput>;
//   };
//   onViewRooms: () => void;
//   isOccupancySheetOpen?: boolean;
//   onOpenOccupancySheet?: () => void;
//   onCloseOccupancySheet?: () => void;
//   onSelectOccupancy?: (value: OccupancyType) => void;
// }

type ViewProps = {
  mode: "view";
  data: FindOneBoardingHouse;
  onViewRooms: () => void;
};

type ModifiableProps = {
  mode: "modifiable";
  data: FindOneBoardingHouse;
  onViewRooms: () => void;

  control: Control<PatchBoardingHouseInput>;
  isEditing: boolean;
  errors: FieldErrors<PatchBoardingHouseInput>;
  form: {
    getValues: UseFormGetValues<PatchBoardingHouseInput>;
    setValue: UseFormSetValue<PatchBoardingHouseInput>;
    watch: UseFormWatch<PatchBoardingHouseInput>;
  };

  isOccupancySheetOpen: boolean;
  onOpenOccupancySheet: () => void;
  onCloseOccupancySheet: () => void;
  onSelectOccupancy: (value: OccupancyType) => void;
};

type BoardingHouseDetailsRenderProps = ViewProps | ModifiableProps;

export default function BoardingHouseDetailsRender(
  props: BoardingHouseDetailsRenderProps,
) {
  if (props.mode === "view") {
    return (
      <View gap={Spacing.base}>
        <BoaBoardingHouseHeaderView
          data={props.data}
          onViewRooms={props.onViewRooms}
        />

        <BoardingHouseBodyView
          data={props.data}
          onViewRooms={props.onViewRooms}
          mode="view"
        />
      </View>
    );
  }

  const {
    data,
    control,
    isEditing,
    errors,
    form,
    onViewRooms,
    isOccupancySheetOpen,
    onOpenOccupancySheet,
    onCloseOccupancySheet,
    onSelectOccupancy,
  } = props;

  return (
    <View gap={Spacing.base}>
      <BoardingHouseHeaderEdit
        mode="modifiable"
        data={data}
        control={control}
        isEditing={isEditing}
        errors={errors}
        form={form}
        onViewRooms={onViewRooms}
        isOccupancySheetOpen={isOccupancySheetOpen}
        onOpenOccupancySheet={onOpenOccupancySheet}
        onCloseOccupancySheet={onCloseOccupancySheet}
        onSelectOccupancy={onSelectOccupancy}
      />

      <BoardingHouseBodyEdit
        data={data}
        control={control}
        isEditing={isEditing}
        errors={errors}
        form={{
          getValues: form.getValues,
          setValue: form.setValue,
          watch: form.watch,
        }}
        onViewRooms={onViewRooms}
        isOccupancySheetOpen={isOccupancySheetOpen}
        onOpenOccupancySheet={onOpenOccupancySheet}
        onCloseOccupancySheet={onCloseOccupancySheet}
        onSelectOccupancy={onSelectOccupancy}
      />
    </View>
  );
}

/**
 * <BoardingHouseDetailsRender
  data={boardinghouse}
  control={control}
  isEditing={globalIsEditing}
  errors={errors}
  form={{ getValues, setValue, watch }}
  onViewRooms={goToRooms}
  isOccupancySheetOpen={isActionSheetOpen}
  onOpenOccupancySheet={() => setIsActionSheetOpen(true)}
  onCloseOccupancySheet={() => setIsActionSheetOpen(false)}
  onSelectOccupancy={(value) => {
    setValue("occupancyType", value, { shouldDirty: true });
    setIsActionSheetOpen(false);
  }}
/>
 */
