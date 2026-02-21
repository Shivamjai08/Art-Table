import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import type { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { fetchArtworks } from "../services/api";
import type { Artwork } from "../types/artwork";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

export default function ArtTable() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [page, setPage] = useState<number>(1);
    const [rows, setRows] = useState<number>(12);

    //  PERSISTENT SELECTION STRATEGY
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const overlayRef = useRef<OverlayPanel>(null);
    const [customCount, setCustomCount] = useState<string>("");

    useEffect(() => {
        loadData();
    }, [page, rows]);

    const loadData = async () => {
        const res = await fetchArtworks(page, rows);
        setArtworks(res.data);
        setTotalRecords(res.pagination.total);
    };

    const onPage = (event: DataTablePageEvent) => {
        setPage((event.page ?? 0) + 1);
        setRows(event.rows ?? 12);
    };
    // Convert ids -> actual rows (ONLY current page)
    const selectedRows = artworks.filter((a) => selectedIds.has(a.id));

    const onSelectionChange = (e: any) => {
        const currentPageIds = artworks.map((a) => a.id);

        const updated = new Set(selectedIds);

        // Remove current page ids first
        currentPageIds.forEach((id) => updated.delete(id));

        // Add newly selected ones
        e.value.forEach((row: Artwork) => updated.add(row.id));

        setSelectedIds(updated);
    };

    //  Custom selection WITHOUT fetching other pages
    const handleCustomSelection = () => {
        const count = parseInt(customCount);

        if (!count || count <= 0) return;

        const updated = new Set(selectedIds);

        const selectable = artworks.slice(0, count);

        selectable.forEach((row) => updated.add(row.id));

        setSelectedIds(updated);
        overlayRef.current?.hide();
    };

    return (
        <>
            <Button
                label="Custom Select"
                onClick={(e) => overlayRef.current?.toggle(e)}
            />

            <OverlayPanel ref={overlayRef}>
                <div className="flex gap-2">
                    <InputText
                        value={customCount}
                        onChange={(e) => setCustomCount(e.target.value)}
                        placeholder="Enter number"
                    />
                    <Button label="Apply" onClick={handleCustomSelection} />
                </div>
            </OverlayPanel>

            <DataTable<Artwork[]>
                value={artworks}
                paginator
                rows={rows}
                totalRecords={totalRecords}
                lazy
                first={(page - 1) * rows}
                onPage={onPage}
                selection={selectedRows}
                onSelectionChange={(e) => onSelectionChange(e)}
                dataKey="id"
                selectionMode="multiple"
            >

                <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Origin" />
                <Column field="artist_display" header="Artist" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Start Date" />
                <Column field="date_end" header="End Date" />
            </DataTable>
        </>
    );
}