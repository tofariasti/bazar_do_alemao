#!/usr/bin/env python3
"""Gera o PDF do encarte promocional em assets/catalogo/encarte-semana.pdf."""

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "catalogo"
OUT_PDF = OUT_DIR / "encarte-semana.pdf"
CONFIG = ROOT / "assets" / "catalogo.json"
LOGO = ROOT / "assets" / "images" / "logo.png"


def ascii_safe(text: str) -> str:
    return (
        text.replace("\u2014", "-")
        .replace("\u2013", "-")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u00e3", "a")
        .replace("\u00e1", "a")
        .replace("\u00e9", "e")
        .replace("\u00ed", "i")
        .replace("\u00f3", "o")
        .replace("\u00fa", "u")
        .replace("\u00e7", "c")
        .replace("\u00ea", "e")
        .replace("\u00f5", "o")
    )


def main() -> None:
    try:
        from fpdf import FPDF
    except ImportError:
        print("Instale: pip3 install fpdf2 -t .python_libs", flush=True)
        raise SystemExit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_margins(18, 18, 18)

    # Capa
    if LOGO.exists():
        pdf.image(str(LOGO), x=55, y=22, w=100)

    pdf.set_y(95)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(75, 0, 130)
    pdf.cell(0, 12, ascii_safe("Bazar do Alemão"), ln=True, align="C")

    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 10, "Encarte de ofertas e destaques", ln=True, align="C")

    pdf.set_font("Helvetica", "I", 10)
    pdf.cell(0, 8, f"Atualizado em {date.today().strftime('%d/%m/%Y')}", ln=True, align="C")

    pdf.ln(8)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(
        0,
        6,
        ascii_safe(
            "Tudo na sua mão - utilidades, decoração, brinquedos, "
            "cama/mesa/banho, eletrônicos e muito mais, com preço de bazar."
        ),
        align="C",
    )

    # Destaques
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(75, 0, 130)
    pdf.cell(0, 10, "Destaques da semana", ln=True)
    pdf.ln(4)

    destaques = [
        ("Utilidades para casa", "Variedades para o dia a dia com preco de bazar."),
        ("Decoracao e presentes", "Novidades na loja e nos stories do Instagram."),
        ("Brinquedos e infantil", "Opcoes para todas as idades - confirme estoque."),
        ("Cama, mesa e banho", "Linha completa para renovar sua casa."),
        ("Eletronicos e acessorios", "Consulte modelos e disponibilidade no WhatsApp."),
    ]

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(40, 40, 40)
    for titulo, desc in destaques:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 7, ascii_safe(f"- {titulo}"), ln=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 5, ascii_safe(desc))
        pdf.ln(2)

    # Contato
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(75, 0, 130)
    pdf.cell(0, 10, "Visite a loja", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(40, 40, 40)
    linhas = [
        "Av. Baltazar de Oliveira Garcia, 2713",
        "Sao Sebastiao - Porto Alegre/RS",
        "CEP 91150-000",
        "",
        "Horarios:",
        "Segunda a sabado: 9h as 20h",
        "Domingos e feriados: 9h as 17h30",
        "",
        "WhatsApp: (51) 98133-5930",
        "Instagram: @bazar_doalemao",
        "",
        "Site: consulte o QR Code na loja ou no Instagram.",
    ]
    for linha in linhas:
        pdf.cell(0, 7, ascii_safe(linha), ln=True)

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(
        0,
        5,
        ascii_safe(
            "Precos, imagens e estoque sujeitos a alteracao sem aviso previo. "
            "Confirme valores e disponibilidade pelo WhatsApp antes de se deslocar."
        ),
    )

    pdf.output(str(OUT_PDF))

    size_kb = OUT_PDF.stat().st_size // 1024
    meta = {
        "titulo": "Encarte da semana",
        "arquivo": "assets/catalogo/encarte-semana.pdf",
        "nomeDownload": "bazar-do-alemao-encarte.pdf",
        "validoAte": None,
        "tamanhoKb": size_kb,
        "atualizadoEm": date.today().isoformat(),
    }
    CONFIG.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"PDF: {OUT_PDF} ({size_kb} KB)")
    print(f"Config: {CONFIG}")


if __name__ == "__main__":
    main()
