import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/application/store/stores";
import { UserRoleEnum } from "@/infrastructure/user/user.types";

import {
  useGetAllQuery as getAllTenant,
  useGetOneQuery as getOneTenant,
  useCreateMutation as createTenant,
  usePatchMutation as patchTenant,
  useDeleteMutation as deleteTenant,
} from "@/infrastructure/tenants/tenant.redux.api";
import { selectUser as selectTenant } from "@/infrastructure/tenants/tenant.redux.slice";
import { Tenant } from "@/infrastructure/tenants/tenant.types";

import {
  useGetAllQuery as getAllOwner,
  useGetOneQuery as getOneOwner,
  useCreateMutation as createOwner,
  usePatchMutation as patchOwner,
  useDeleteMutation as deleteOwner,
} from "@/infrastructure/owner/owner.redux.api";
import { selectUser as selectOwner } from "@/infrastructure/owner/owner.redux.slice";
import { Owner } from "@/infrastructure/owner/owner.types";

import {
  useGetAllQuery as getAllAdmin,
  useGetOneQuery as getOneAdmin,
  useCreateMutation as createAdmin,
  usePatchMutation as patchAdmin,
  useDeleteMutation as deleteAdmin,
  selectUser as selectAdmin,
} from "@/infrastructure/admin/admin.redux.slice";
import { Admin } from "@/infrastructure/admin/admin.types";

// eslint-disable-next-line
const noop = (...args: unknown[]) => {
  throw new Error("NOOP: This operation is not supported for GUEST user.");
};

type ApiMapRecord = {
  [UserRoleEnum.TENANT]: {
    getAll: typeof getAllTenant;
    getOne: typeof getOneTenant;
    create: typeof createTenant;
    patch: typeof patchTenant;
    delete: typeof deleteTenant;
    selector: (state: RootState) => Tenant | null;
  };
  [UserRoleEnum.OWNER]: {
    getAll: typeof getAllOwner;
    getOne: typeof getOneOwner;
    create: typeof createOwner;
    patch: typeof patchOwner;
    delete: typeof deleteOwner;
    selector: (state: RootState) => Owner | null;
  };
  [UserRoleEnum.ADMIN]: {
    getAll: typeof getAllAdmin;
    getOne: typeof getOneAdmin;
    create: typeof createAdmin;
    patch: typeof patchAdmin;
    delete: typeof deleteAdmin;
    selector: (state: RootState) => Admin | null;
  };
  [UserRoleEnum.GUEST]: {
    getAll: () => undefined;
    getOne: () => undefined;
    create: () => undefined;
    patch: () => undefined;
    delete: () => undefined;
    selector: () => undefined;
  };
};

export const apiMap: ApiMapRecord = {
  [UserRoleEnum.TENANT]: {
    getAll: getAllTenant,
    getOne: getOneTenant,
    create: createTenant,
    patch: patchTenant,
    delete: deleteTenant,
    selector: (state: RootState) => state.tenants.selectedUser,
  },
  [UserRoleEnum.OWNER]: {
    getAll: getAllOwner,
    getOne: getOneOwner,
    create: createOwner,
    patch: patchOwner,
    delete: deleteOwner,
    selector: (state: RootState) => state.owners.selectedUser,
  },
  [UserRoleEnum.ADMIN]: {
    getAll: getAllAdmin,
    getOne: getOneAdmin,
    create: createAdmin,
    patch: patchAdmin,
    delete: deleteAdmin,
    selector: (state: RootState) => state.admins.selectedUser,
  },
  [UserRoleEnum.GUEST]: {
    getAll: () => noop(),
    getOne: () => noop(),
    create: () => noop(),
    patch: () => noop(),
    delete: () => noop(),
    selector: () => undefined,
  },
};

export type PatchData = Partial<Tenant> | Partial<Owner> | Partial<Admin>;

export function useDynamicUserApi() {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.userData);
  const role = authUser?.role ?? UserRoleEnum.GUEST;
  const id = authUser?.id;

  // ✅ Call all possible hooks once, at the top level (this keeps React happy)
  const tenantAll = getAllTenant();
  const ownerAll = getAllOwner();
  const adminAll = getAllAdmin();

  const tenantOne = id ? getOneTenant(id, { skip: !id }) : null;
  const ownerOne = id ? getOneOwner(id, { skip: !id }) : null;
  const adminOne = id ? getOneAdmin(id, { skip: !id }) : null;

  const [tenantCreate] = createTenant();
  const [ownerCreate] = createOwner();
  const [adminCreate] = createAdmin();

  const [tenantPatch] = patchTenant();
  const [ownerPatch] = patchOwner();
  const [adminPatch] = patchAdmin();

  const [tenantDelete] = deleteTenant();
  const [ownerDelete] = deleteOwner();
  const [adminDelete] = deleteAdmin();

  // ✅ Pick the active API set based on role
  const allQuery =
    role === UserRoleEnum.TENANT
      ? tenantAll
      : role === UserRoleEnum.OWNER
        ? ownerAll
        : role === UserRoleEnum.ADMIN
          ? adminAll
          : undefined;

  const oneQuery =
    role === UserRoleEnum.TENANT
      ? tenantOne
      : role === UserRoleEnum.OWNER
        ? ownerOne
        : role === UserRoleEnum.ADMIN
          ? adminOne
          : undefined;

  const createMutation =
    role === UserRoleEnum.TENANT
      ? tenantCreate
      : role === UserRoleEnum.OWNER
        ? ownerCreate
        : role === UserRoleEnum.ADMIN
          ? adminCreate
          : undefined;

  const patchMutation =
    role === UserRoleEnum.TENANT
      ? tenantPatch
      : role === UserRoleEnum.OWNER
        ? ownerPatch
        : role === UserRoleEnum.ADMIN
          ? adminPatch
          : undefined;

  const deleteMutation =
    role === UserRoleEnum.TENANT
      ? tenantDelete
      : role === UserRoleEnum.OWNER
        ? ownerDelete
        : role === UserRoleEnum.ADMIN
          ? adminDelete
          : undefined;

  // ✅ Select user slice
  const selectedTenant = useSelector(
    (state: RootState) => state.tenants.selectedUser,
  );
  const selectedOwner = useSelector(
    (state: RootState) => state.owners.selectedUser,
  );
  const selectedAdmin = useSelector(
    (state: RootState) => state.admins.selectedUser,
  );

  const selectedUser =
    role === UserRoleEnum.TENANT
      ? selectedTenant
      : role === UserRoleEnum.OWNER
        ? selectedOwner
        : selectedAdmin;

  // ✅ fetchAndSelect helper
  const fetchAndSelect = async (id: number) => {
    const query = oneQuery;
    const res = await query?.refetch?.();
    if (res?.data) {
      if (role === UserRoleEnum.TENANT)
        dispatch(selectTenant(res.data as Tenant));
      else if (role === UserRoleEnum.OWNER)
        dispatch(selectOwner(res.data as Owner));
      else if (role === UserRoleEnum.ADMIN)
        dispatch(selectAdmin(res.data as Admin));
    }
  };

  // ✅ patchUser helper
  const patchUser = async (id: number, data: PatchData) => {
    let result;
    if (role === UserRoleEnum.TENANT) {
      result = await tenantPatch({
        id,
        data: data as Partial<Tenant>,
      }).unwrap();
    } else if (role === UserRoleEnum.OWNER) {
      result = await ownerPatch({ id, data: data as Partial<Owner> }).unwrap();
    } else if (role === UserRoleEnum.ADMIN) {
      result = await adminPatch({ id, data: data as Partial<Admin> }).unwrap();
    }

    await refetchUser();

    return result;
  };

  const refetchUser = async () => {
    if (!id) return;

    const res = await oneQuery?.refetch?.();

    if (res?.data) {
      if (role === UserRoleEnum.TENANT)
        dispatch(selectTenant(res.data as Tenant));
      else if (role === UserRoleEnum.OWNER)
        dispatch(selectOwner(res.data as Owner));
      else if (role === UserRoleEnum.ADMIN)
        dispatch(selectAdmin(res.data as Admin));
    }

    return res;
  };

  return {
    role,
    id,
    selectedUser,
    allQuery,
    oneQuery,
    createMutation,
    patchUser,
    deleteMutation,
    fetchAndSelect,
    refetch: refetchUser,
  };
}

//* Usage
/*
* const {
*   selectedUser,
*   oneQuery,
*   allQuery,
*   createMutation,
*   patchMutation,
*   deleteMutation,
*   fetchAndSelect
* } = useDynamicUserApi();
* 
* // Example: prefill form
* useEffect(() => {
*   if (oneQuery?.data) {
*     setForm(oneQuery.data);
*   }
* }, [oneQuery?.data]);
* 
* // Example: create new
* const handleCreate = (data) => {
*   createMutation(data).unwrap().then(() => {
*     console.log("Created!");
*   });
* };
* 
* // Example: update
* const handleUpdate = (data) => {
*   patchMutation({ id: selectedUser.id, data }).unwrap().then(() => {
*     console.log("Updated!");
*   });
* };
* 
* // Good for refinement later on 
* export function useDynamicUserOne(id: number) { ... }
* export function useDynamicUserAll() { ... }
* export function useDynamicUserCreate() { ... }

*/
