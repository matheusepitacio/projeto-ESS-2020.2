import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';

import { Aluno } from '../../../common/aluno';
import { AlunoService } from './aluno.service';

@Component({
  selector: 'notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.css']
})
export class NotasComponent implements OnInit {
  constructor(private alunoService: AlunoService) { }

  alunos: Aluno[];

  atualizarAluno(aluno: Aluno): String {
    var temp: Aluno = new Aluno();
    temp.copyFrom(aluno);
    this.alunoService.atualizar(aluno).subscribe(
      (a) => { if (a == null) alert("Unexpected fatal error trying to update student information! Please contact the systems administratos."); },
      (msg) => { alert(msg.message); }
    );
    return temp.media;
  }

  removerNota(aluno: Aluno, nota: string): string {
    aluno.notas[nota] = null;
    var temp: Aluno = new Aluno();
    temp.copyFrom(aluno);
    this.alunoService.atualizar(aluno).subscribe(
      (a) => { if (a == null) alert("Unexpected fatal error trying to update student information! Please contact the systems administratos."); },
      (msg) => { alert(msg.message); }
    );
    return temp.media;
  }

  ngOnInit(): void {
    this.alunoService.getAlunos()
      .subscribe(
        (as) => { this.alunos = as; },
        (msg) => { alert(msg.message); }
      );
  }


}
