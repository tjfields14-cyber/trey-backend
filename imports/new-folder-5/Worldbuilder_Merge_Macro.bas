Attribute VB_Name = "MergeChapters"
Sub MergeAllChapters()
    Dim dlgOpen As FileDialog
    Dim selectedFile As Variant
    Dim docMain As Document
    Dim docTemp As Document
    Dim rng As Range

    Set docMain = ThisDocument
    Set dlgOpen = Application.FileDialog(msoFileDialogFilePicker)

    With dlgOpen
        .Title = "Select Chapter Files to Merge"
        .AllowMultiSelect = True
        .Filters.Clear
        .Filters.Add "Word Documents", "*.docx"

        If .Show <> -1 Then Exit Sub

        For Each selectedFile In .SelectedItems
            Set docTemp = Documents.Open(selectedFile, ReadOnly:=True)
            docTemp.Content.Copy

            Set rng = docMain.Range
            rng.Collapse Direction:=wdCollapseEnd
            rng.InsertParagraphAfter
            rng.Collapse Direction:=wdCollapseEnd
            rng.Paste

            docMain.Range.InsertAfter vbCrLf & "----- END OF " & selectedFile & " -----" & vbCrLf
            docTemp.Close SaveChanges:=False
        Next selectedFile
    End With

    MsgBox "✅ Merge complete!", vbInformation
End Sub
