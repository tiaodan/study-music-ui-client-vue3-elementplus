$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open("C:\Users\ancha\Desktop\历正所有LZ\OKR复盘模板\OKR复盘模板-2026Q1.docx")
$doc.Content.Text
$doc.Close()
$word.Quit()