import { View, Text } from "react-native";
import React from "react";
import {
  FindOneRoom,
  PatchRoomInput,
  RoomFurnishingType,
  RoomType,
} from "@/infrastructure/room/rooms.schema";
import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { RoomHeaderEdit, RoomHeaderView } from "./RoomHeader";
import { RoomBodyEdit, RoomBodyView } from "./RoomBody";

type ViewProps = {
  mode: "view";
  data: FindOneRoom;
  goToBook: () => void;
};

type ModifiableProps = {
  mode: "modifiable";
  data: FindOneRoom;
  goToBook: () => void;

  control: Control<PatchRoomInput>;
  isEditing: boolean;
  errors: FieldErrors<PatchRoomInput>;
  form: {
    getValues: UseFormGetValues<PatchRoomInput>;
    setValue: UseFormSetValue<PatchRoomInput>;
    watch: UseFormWatch<PatchRoomInput>;
  };

  isFurnishingTypeSheetOpen: boolean;
  onOpenFurnishingTypeSheet: () => void;
  onCloseFurnishingTypeSheet: () => void;
  onSelectFurnishingType: (value: RoomFurnishingType) => void;

  isRoomTypeSheetOpen: boolean;
  onOpenRoomTypeSheet: () => void;
  onCloseRoomTypeSheet: () => void;
  onSelectRoomType: (value: RoomType) => void;
};

type BoardingHouseDetailsRenderProps = ViewProps | ModifiableProps;

export default function RoomDetailsRender(
  props: BoardingHouseDetailsRenderProps,
) {
  if (props.mode === "view") {
    return (
      <View>
        <RoomHeaderView data={props.data} goToBook={props.goToBook} />

        <RoomBodyView
          data={props.data}
          onViewRooms={props.goToBook}
          mode="view"
        />
      </View>
    );
  }

  const {
    control,
    data,
    errors,
    form,
    goToBook,
    isEditing,
    mode,
    isFurnishingTypeSheetOpen,
    isRoomTypeSheetOpen,
    onCloseFurnishingTypeSheet,
    onCloseRoomTypeSheet,
    onOpenFurnishingTypeSheet,
    onOpenRoomTypeSheet,
    onSelectFurnishingType,
    onSelectRoomType,
  } = props;
  return (
    <View>
      <RoomHeaderEdit
        data={data}
        control={control}
        isEditing={isEditing}
        errors={errors}
        form={form}
        onOpenFurnishingTypeSheet={onOpenFurnishingTypeSheet}
        onOpenRoomTypeSheet={onOpenRoomTypeSheet}
      />

      <RoomBodyEdit
        data={data}
        control={control}
        isEditing={isEditing}
        errors={errors}
        form={{
          getValues: form.getValues,
          setValue: form.setValue,
          watch: form.watch,
        }}
      />
    </View>
  );
}
