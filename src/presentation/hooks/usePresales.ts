import { Presale } from "@domain/entities";
import { CreatePresaleDTO, PresaleFilters, UpdatePresaleDTO } from "@domain/ports";
import { container } from "@infrastructure/config";
import { useCallback, useState } from "react";
import { extractErrorMessage, usePagination } from "./shared";

export interface UsePresalesReturn {
    presales: Presale[];

    page: number;
    total: number;
    totalPages: number;
    goToPage: (page: number) => Promise<void>;
    applyFilters: (filters?: PresaleFilters) => Promise<void>;
    refreshCurrentPage: () => Promise<void>;

    isLoading: boolean;
    error: string | null;
    clearError: () => void;
    clearCache: () => void;

    presaleById: (presaleId: number, details?: boolean) => Promise<Presale | null>;
    assignDistributor: (presaleid: number, distributorId: number) => Promise<Presale | null>;
    createPresale: (data: CreatePresaleDTO) => Promise<Presale | null>;
    updatePresale: (id: number, data: UpdatePresaleDTO) => Promise<Presale | null>;
    cancelPresale: (id: number, reason?: string) => Promise<Presale | null>;
}

const LIMIT = 10;

export const usePresales = (): UsePresalesReturn => {
    const [crudLoading, setCrudLoading] = useState(false);
    const [crudError, setCrudError] = useState<string | null>(null);

    const fetchPresales = useCallback(async (filters: PresaleFilters, page: number, limit: number) => {
        const result = await container.presales.getAll({ ...filters, page, limit });
        return {
            data: result.data,
            total: result.total,
            totalPages: result.totalPages,
        };
    }, []);

    const {
        items: presales,
        pagination,
        isLoading: paginationLoading,
        error: paginationError,
        goToPage,
        applyFilters,
        refreshCurrentPage,
        clearError: clearPaginationError,
        clearCache,
    } = usePagination<Presale, PresaleFilters>({
        fetchFn: fetchPresales,
        limit: LIMIT,
    });

    const presaleById = useCallback(async (idPresale: number, details?: boolean): Promise<Presale | null> => {
        setCrudLoading(true);
        setCrudError(null);
        try {
            const presale = await container.presales.getById(idPresale, details);
            clearCache();
            await refreshCurrentPage();
            return presale;
        } catch (e: any) {
            setCrudError(extractErrorMessage(e));
            return null;
        } finally {
            setCrudLoading(false)
        }
    }, []);

    const assignDistributor = useCallback(async (idPresale: number, idDistributor: number): Promise<Presale | null> => {
        setCrudLoading(true);
        setCrudError(null);
        try {
            const assigned = await container.presales.assign(idPresale, idDistributor);
            clearCache();
            await refreshCurrentPage();
            return assigned;
        } catch (e: any) {
            setCrudError(extractErrorMessage(e));
            return null;
        } finally {
            setCrudLoading(false)
        }
    }, [clearCache, refreshCurrentPage]);

    const createPresale = useCallback(async (data: CreatePresaleDTO): Promise<Presale | null> => {
        setCrudLoading(true);
        setCrudError(null);
        try {
            const newProduct = await container.presales.create(data);
            clearCache();
            await applyFilters();
            return newProduct;
        } catch (err) {
            setCrudError(extractErrorMessage(err));
            return null;
        } finally {
            setCrudLoading(false);
        }
    }, [clearCache, applyFilters]);

    const updatePresale = useCallback(async (id: number, data: UpdatePresaleDTO): Promise<Presale | null> => {
        setCrudLoading(true);
        setCrudError(null);
        try {
            const updated = await container.presales.update(id, data);
            clearCache();
            await refreshCurrentPage();
            return updated;
        } catch (err) {
            setCrudError(extractErrorMessage(err));
            return null;
        } finally {
            setCrudLoading(false);
        }
    }, [clearCache, refreshCurrentPage]);

    const cancelPresale = useCallback(async (id: number, reason?: string): Promise<Presale | null> => {
        setCrudLoading(true);
        setCrudError(null);
        try {
            const canceled = await container.presales.cancelPresale(id, reason);
            clearCache();
            await refreshCurrentPage();
            return canceled;
        } catch (err) {
            setCrudError(extractErrorMessage(err));
            return null;
        } finally {
            setCrudLoading(false);
        }
    }, [clearCache, refreshCurrentPage]);

    const clearError = useCallback(() => {
        clearPaginationError();
        setCrudError(null);
    }, [clearPaginationError]);

    return {
        presales,
        page: pagination.page,
        total: pagination.total,
        totalPages: pagination.totalPages,
        goToPage,
        applyFilters,
        refreshCurrentPage,
        isLoading: paginationLoading || crudLoading,
        error: paginationError || crudError,
        clearError,
        clearCache,
        assignDistributor,
        createPresale,
        updatePresale,
        presaleById,
        cancelPresale,
    };
};

