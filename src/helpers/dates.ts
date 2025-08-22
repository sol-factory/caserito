function getWeekOfYear(fecha: Date) {
  // Crear una copia de la fecha al comienzo de la semana para evitar mutaciones.
  const fechaCopia = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  );
  const diaSemana = fechaCopia.getUTCDay() || 7; // Domingo es 7 en ISO

  // Ajusta la fecha para que siempre caiga en el jueves de la semana ISO.
  fechaCopia.setUTCDate(fechaCopia.getUTCDate() + 4 - diaSemana);

  // Calcular el inicio del año en el jueves de la primera semana ISO.
  const inicioDelAnio = new Date(Date.UTC(fechaCopia.getUTCFullYear(), 0, 1));
  const primerDiaSemana = inicioDelAnio.getUTCDay() || 7;
  const primerJueves = new Date(inicioDelAnio);
  primerJueves.setUTCDate(inicioDelAnio.getUTCDate() + (4 - primerDiaSemana));

  // Diferencia entre la fecha ajustada y el primer jueves del año.
  const diff = +fechaCopia - +primerJueves;
  const numeroSemana = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

  return numeroSemana;
}
