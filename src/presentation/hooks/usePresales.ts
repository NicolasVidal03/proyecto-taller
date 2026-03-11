import { Presale } from "@domain/entities";
import { PresaleFilters } from "@domain/ports";
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

    assignDistributor: (presaleid: number, distributorId: number) => Promise<Presale | null>
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
    };
};

